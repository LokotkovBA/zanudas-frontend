import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { getRequest, postRequest } from "../utils/api-requests";
import { DBLikesState, DBQueueEntry, LikesState, QueueEntry, UserData } from "../utils/interfaces";

import telegramIconPath from "../icons/telegram.svg";
import twitchIconPath from '../icons/twitch.svg';

import { queueDBtoData } from "../utils/conversions";
import { AdminMenu } from "../components/AdminMenu";
import { useMutation, useQuery } from "react-query";
import { LoaderBox } from "../components/LoaderBox";
import { socket } from "../utils/socket-client";
import { QueueModElement } from "../components/QueueModElement";
import { QueueElement } from "../components/QueueElement";
import { AxiosError, AxiosResponse } from "axios";
import { Alert } from "../components/Alert";

const Queue: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [queueData, setQueueData] = useState<QueueEntry[]>([]);
    const [queueLikes, setQueueLikes] = useState<LikesState[]>([]);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [sliding, setSliding] = useState<string>('sliding');

    const [isLive, setIsLive] = useState<boolean>(false);

    function updateQueueData(response: AxiosResponse<any, any>){
        setQueueData(response.data.songs.map((song: DBQueueEntry) => queueDBtoData(song)));
        setIsLive(response.data.is_live);
    }

    const { isLoading, isError, isSuccess } = useQuery(['queue-data'], () => getRequest('queue/get', '5100'), {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            updateQueueData(data);
        }
    });

    const options = {
        onError: (error: AxiosError) => {
            setAlertMessage(error.message);
            setSliding('');
        },
        onSuccess: () => {
            setSliding('');
            setAlertMessage('Success!');
            setTimeout(() => {
                setSliding('sliding');
            }, 3000);
        }
    };

    const queueChangeRequest = useMutation((newQueueData: QueueEntry) => postRequest('queue/change', '5100', newQueueData), options);

    const deleteQueueEntryRequest = useMutation((delEntry :{ id: number; index: number}) => postRequest('queue/delete', '5100', { id: delEntry.id }), {
        onSuccess: (response, delEntry) => {
            setQueueData(prevQueueData => {
                let newQueueData = [...prevQueueData];
                newQueueData.splice(delEntry.index, 1);
                return newQueueData;
            });
        },
        onError: (error, delEntry) => {
            setQueueData(prevQueueData => {
                let newQueueData = [...prevQueueData];
                newQueueData[delEntry.index].delete_button_text = 'Error!';
                newQueueData[delEntry.index].delete_intention = true;
                return newQueueData;
            });
        }
    });

    function changeDeleteIntention(del_index: number, text: string, delete_intention: boolean){
        setQueueData(prevQueueData => {
            let newQueueData = [...prevQueueData];
            newQueueData[del_index].delete_button_text = text;
            newQueueData[del_index].delete_intention = delete_intention;
            return newQueueData;
        });
    }

    function changeModView(index: number){
        setQueueData(prevQueueData =>{
            let newQueuedata = [...prevQueueData];
            newQueuedata[index].modView = !prevQueueData[index].modView;
            newQueuedata[index].style = newQueuedata[index].modView ? 'mod-view' : 'simple-view';
            newQueuedata[index].button_text = newQueuedata[index].modView ? 'Hide' : 'More';
            return newQueuedata;
        });
    };

    const getLikes = useQuery(['likes-data'], () => getRequest('queue/getAllLikes', '5100'),{
        enabled: userData.display_name !== '',
        onSuccess: (response) => {
            if (response.data.is_empty) {
                setQueueLikes([]);
            } else {
                setQueueLikes(response.data.map((like: DBLikesState) => ({ ...like, song_id: parseInt(like.song_id) })));
            }
        },
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if(getLikes.data){
            setQueueLikes(getLikes.data.data.map((like: DBLikesState) => ({ ...like, song_id: parseInt(like.song_id) })));
        }
    },[getLikes.data]);

    const addLikeRequest = useMutation((likeData: {song_id : number, is_positive: number, song_index: number}) => postRequest('queue/addLike', '5100',{ song_id: likeData.song_id, is_positive: likeData.is_positive, song_index: likeData.song_index}));

    function clickLikeHandler(song_id: number, is_positive: number, index: number){
        if (userData.display_name) {
            addLikeRequest.mutate({ song_id: song_id, is_positive: is_positive, song_index: index});
        }
    };

    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>, curIndex: number) {
        setQueueData(prevQueueData => {
            const { name, value, type, checked } = event.target;
            return prevQueueData.map((entry, index) => {
                return index === curIndex ? {
                    ...entry,
                    [name]: type === 'checkbox' ? checked : value
                } : entry;
            });
        });
    };

    function queueEntryTextAreaChangeEvent(event: React.ChangeEvent<HTMLTextAreaElement>, curIndex: number) {
        setQueueData(prevQueueData => {
            const { name, value } = event.target;
            return prevQueueData.map((entry, index) => {
                return index === curIndex ? {
                    ...entry,
                    [name]: value
                } : entry;
            });
        });
    };

    function queueHandleOnDragEnd(result: DropResult) {
        if (result.destination) {
            setQueueData(prevQueueData => {
                const newOrder = [...prevQueueData];
                const [reorderedEntry] = newOrder.splice(result.source.index, 1);
                reorderedEntry.classN = 'moved';
                newOrder.splice(result.destination!.index, 0, reorderedEntry);
                return newOrder;
            });
        }
    };

    const queueOrderRequest = useMutation((newOrder: { id: number, queue_number: number}[]) => postRequest('queue/order', '5100', newOrder), options);

    function changeQueueOrder() {
        const newOrder = queueData.map((elem, index) => ({ id: elem.id, queue_number: index }));
        setQueueData(prevQueueData => prevQueueData.map((elem, index) => ({ ...elem, queue_number: index, classN: '' })));
        queueOrderRequest.mutate(newOrder);
    };

    useEffect(() => {
        socket.on('queue change', (data) => {
            setQueueData(data.songs.map((song: DBQueueEntry) => (queueDBtoData(song))));
        });
        socket.on('song likes change', ({count, song_index}) => {
            setQueueData(oldQueueData => {
                let newQueueData = [...oldQueueData]
                newQueueData[song_index].like_count = count;
                return newQueueData;
            })
        })
        return (() => {
            socket.off('queue change');
            socket.off('song likes change');
        });
    },[getLikes]);

    useEffect(() =>{
        if(userData.display_name){
            socket.on('likes change',(likes: DBLikesState[]) => {
                setQueueLikes(likes.map(like => { return {...like, song_id: parseInt(like.song_id)} }));
            })
            socket.on('connect',() =>{
                socket.emit('sub likes', userData.display_name);
            });
            socket.emit('sub likes', userData.display_name);
        };
        return (() =>  {
            socket.emit('unsub likes', userData.display_name);
            socket.off('likes change');
            socket.off('connect');
        });
    },[userData.display_name])

    useEffect(() => {
        socket.on('queue status', (data) => {
            setIsLive(data);
        });
        return (() => {
            socket.off('queue status');
        });
    }, []);

    if(isLoading){
        return  <div className="song-list">
                    <LoaderBox/>
                </div>
    };

    return (
        <div className="queue-list">
            {userData.is_mod ?
                <div className="chad-view">
                    <DragDropContext onDragEnd={queueHandleOnDragEnd}>
                        <Droppable droppableId="queue">
                            {provided => (
                                <ul {...provided.droppableProps} ref={provided.innerRef}>
                                    <button className="order-button" onClick={changeQueueOrder}>Order</button>
                                    {  queueData.map((entry, index) => <QueueModElement 
                                            entry={entry}
                                            like_count={entry.like_count}
                                            index={index}
                                            user_likes={queueLikes}
                                            user_id={userData.id}
                                            change_mod_view={changeModView}
                                            queue_entry_change_event={queueEntryChangeEvent}
                                            queue_entry_text_area_change_event={queueEntryTextAreaChangeEvent}
                                            queue_change_request={queueChangeRequest}
                                            delete_queue_entry_request={deleteQueueEntryRequest}
                                            change_delete_intention={changeDeleteIntention}
                                            click_like_handler={clickLikeHandler}
                                            key={entry.id}
                                            />    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                :
                (isLive && <div className="pleb-view">
                    {queueData.map((entry, index) => {
                        if(entry.visible){
                            return (<QueueElement
                            entry={entry}
                            like_count={entry.like_count}
                            index={index}
                            user_id={userData.id}
                            user_likes={queueLikes}
                            click_like_handler={clickLikeHandler}
                            key={entry.id}
                            />)
                        }
                        return '';
                    })}
                </div>)
            }
            {userData.is_admin &&
                <ul className="admin-menu">
                    <AdminMenu 
                    display_name={userData.display_name}
                    is_admin={userData.is_admin} 
                    is_live={isLive} 
                    />
                </ul>}
            {isSuccess && !userData.is_mod && !userData.is_admin && !isLive && (
            <div className="dead-queue">
                Queue is not live!
                <div>
                    Check out
                    <a rel="noreferrer" target='_blank' href="https://www.twitch.tv/zanuda"><img src={twitchIconPath} alt='twitch icon'/></a>
                    <a rel="noreferrer" target='_blank' href="https://t.me/etzalert"><img src={telegramIconPath} alt='telegram icon'/></a>
                </div>
            </div>)}
            {isError && <Alert message="Couldn't load queue!" class_name='alert loading-error'/>}
            <Alert class_name={`alert fetch ${sliding}`} message={alertMessage}/>
        </div>
    );
}


export default Queue;