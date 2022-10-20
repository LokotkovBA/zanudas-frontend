import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BACKEND_ADDRESS, getRequest, postRequest } from "../utils/api-requests";
import { DBLikesState, DBQueueEntry, LikesState, QueueEntry, UserData } from "../utils/interfaces";

import pathToArrowRight from '../icons/arrow-right.svg';
import telegramIconPath from "../icons/telegram.svg";
import twitchIconPath from '../icons/twitch.svg';

import { queueDBtoData } from "../utils/conversions";
import { AdminMenu } from "../components/AdminMenu";
import { QueueItemInfo } from "../components/QueueItemInfo";
import { LikeBlock } from "../components/LikeBlock";


const Queue: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [queueData, setQueueData] = useState<QueueEntry[]>([]);
    const [queueComponents, setQueueComponents] = useState<JSX.Element[]>([]);
    const [queueLikes, setQueueLikes] = useState<LikesState[]>([]);

    const [isLive, setIsLive] = useState<boolean>(false);

    const [maxDisplay, setMaxDisplay] = useState<number>(0);

    const [curFontSize, setCurFontSize] = useState<string>('');

    const [infoText, setInfoText] = useState<string>('');
    const [showInfo, setShowInfo] = useState<boolean>(false);

    useEffect(() => {
        if(userData.is_admin){
            getRequest('admin/getShowInfo','5100')
                .then(response => response.json())
                .then(data =>{
                    setInfoText(data.textInfo);
                    setShowInfo(data.showInfo);
                });
        };
    },[userData.is_admin])

    const getQueue = useCallback( () => {
        getRequest('queue/get', '5100')
            .then(response => response.json())
            .then(data =>{
                setQueueData(data.songs.map((song: DBQueueEntry) => queueDBtoData(song)));
                setMaxDisplay(data.max_display);
            });
    },[]);

    const changeQueueEntry = useCallback((entryId: number) => {
        const curIndex = queueData.findIndex(entry => entry.id === entryId);
        postRequest('queue/change', '5100', JSON.stringify(queueData[curIndex]));
    }, [queueData]);

    const deleteQueueEntry = useCallback((entryId: number) => {
        const delIndex = queueData.findIndex(entry => entry.id === entryId);
        if(queueData[delIndex].delete_intention){
            setQueueData(prevQueueData => {
                let newQueueData = [...prevQueueData];
                newQueueData.splice(delIndex, 1);
                return newQueueData;
            });
            postRequest('queue/delete', '5100', JSON.stringify({ id: entryId }));
        }else{
            setQueueData(prevQueueData => {
                let newQueueData = [...prevQueueData];
                newQueueData[delIndex].delete_button_text = 'Sure?';
                newQueueData[delIndex].delete_intention = true;
                return newQueueData;
            });
        }
    }, [queueData]);

    const changeModView = useCallback((enrtyId: number) =>{
        const index = queueData.findIndex(enrty => enrty.id === enrtyId);
        setQueueData(prevQueueData =>{
            let newQueuedata = [...prevQueueData];
            newQueuedata[index].modView = !prevQueueData[index].modView;
            newQueuedata[index].style = newQueuedata[index].modView ? 'mod-view' : 'simple-view';
            newQueuedata[index].button_text = newQueuedata[index].modView ? 'Hide' : 'More';
            return newQueuedata;
        });
    }, [queueData]);

    const getCurLikes = useCallback(() => {
        if (userData.display_name) {
            getRequest('queue/getAllLikes', '5100')
                .then(response => response.json())
                .then(data => {
                    if (data.is_empty) {
                        setQueueLikes([]);
                    } else {
                        setQueueLikes(data.map((like: DBLikesState) => ({ ...like, song_id: parseInt(like.song_id) })));
                    }
                });
        }
    }, [userData.display_name]);

    const clickLikeHandler = useCallback((song_id: number, is_positive: number) => {
        if (userData.display_name) {
            postRequest('queue/addLike', '5100', JSON.stringify({ song_id: song_id, is_positive: is_positive }))
        }
    }, [userData.display_name]);


    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setQueueData(prevQueueData => {
            const { name, value, className, type, checked } = event.target;
            const curIndex = prevQueueData.findIndex(entry => entry.id === parseInt(className));
            return prevQueueData.map((entry, index) => {
                return index === curIndex ? {
                    ...entry,
                    [name]: type === 'checkbox' ? checked : value
                } : entry;
            });
        });
    };

    function queueEntryTextAreaChangeEvent(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setQueueData(prevQueueData => {
            const { name, value, className } = event.target;
            const curIndex = prevQueueData.findIndex(entry => entry.id === parseInt(className));
            return prevQueueData.map((entry, index) => {
                return index === curIndex ? {
                    ...entry,
                    [name]: value
                } : entry;
            });
        });
    }

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

    function changeQueueOrder() {
        const newOrder = queueData.map((elem, index) => ({ id: elem.id, queue_number: index }));
        setQueueData(prevQueueData => prevQueueData.map((elem, index) => ({ ...elem, queue_number: index, classN: '' })));
        postRequest('queue/order', '5100', JSON.stringify(newOrder));
    };

    useEffect(() => {
        if (userData.is_mod) {
            setQueueComponents(queueData.map((entry, index) =>
                <Draggable key={entry.id} draggableId={entry.id.toString()} index={index}>
                    {(provided) => {
                        const curIndex = queueLikes.findIndex(like => like.song_id === entry.id);
                        return (
                            <div className={`${entry.style} ${entry.classN}`} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                {entry.modView && <>
                                <p className="queue-num">{index + 1}</p>
                                <input type='text' name='artist' placeholder="artist" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.artist ? entry.artist : ''} />
                                <input type='text' name='song_name' placeholder="song name" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.song_name ? entry.song_name : ''} />
                                <input type='text' name='donor_name' placeholder="donor name" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.donor_name} />
                                <input type='text' name='donate_amount' placeholder="amount" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.donate_amount} />
                                <input type='text' name='currency' placeholder="currency" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.currency} />
                                <input type='text' name='tag' placeholder="tag" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.tag ? entry.tag : ''} />
                                <textarea name='donor_text' className={entry.id.toString()} onChange={queueEntryTextAreaChangeEvent} value={entry.donor_text} />
                                </>}
                                {!entry.modView && 
                                    <QueueItemInfo index={index} 
                                    artist={entry.artist} 
                                    song_name={entry.song_name} 
                                    currency={entry.currency} 
                                    donate_amount={entry.donate_amount} 
                                    donor_name={entry.donor_name} 
                                    current={entry.current} 
                                    played={entry.played} 
                                    key={entry.id} 
                                    />
                                }
                                <div className='button-group'>
                                    <button onClick={() => changeQueueEntry(entry.id)}>Apply</button>
                                    <button onClick={() => deleteQueueEntry(entry.id)}>{entry.delete_button_text}</button>
                                    <button onClick={() => changeModView(entry.id)}>{entry.button_text}</button>
                                </div>
                                <div className="last-block">
                                    <LikeBlock like_state={queueLikes[curIndex]}
                                    user_id={userData.id}
                                    song_id={entry.id} 
                                    like_count={entry.like_count} 
                                    clickLikeHandler={clickLikeHandler} />
                                    <div className="checkboxes">
                                        <input type='checkbox' className={entry.id.toString()} name='played' checked={entry.played} onChange={queueEntryChangeEvent} />
                                        <label htmlFor='played'>played</label> {/*если сыграно, то нельзя менять порядок */}
                                        <input type='checkbox' className={entry.id.toString()} name='will_add' checked={entry.will_add} onChange={queueEntryChangeEvent} />
                                        <label htmlFor='will_add'>will add</label>
                                        <input type='checkbox' className={entry.id.toString()} name='visible' checked={entry.visible} onChange={queueEntryChangeEvent} />
                                        <label htmlFor='visible'>visible</label>
                                        <input type='checkbox' className={entry.id.toString()} name='current' checked={entry.current} onChange={queueEntryChangeEvent} />
                                        <label htmlFor='current'>current</label>
                                    </div>
                                </div>
                            </div>);
                    }
                    }
                </Draggable>
            ));
        } else {
            setQueueComponents(queueData.filter(entry => entry.artist && 
                entry.visible).map((entry, index) => {
                const curIndex = queueLikes.findIndex(like => like.song_id === entry.id);
                return (
                <div className="list-item queue" key={entry.id}>
                    <div className="arrow-info-block">
                    {entry.current && <img src={pathToArrowRight} alt="arrow pointing right"/>}
                        <QueueItemInfo index={index} 
                        artist={entry.artist} 
                        song_name={entry.song_name} 
                        currency={entry.currency} 
                        donate_amount={entry.donate_amount} 
                        donor_name={entry.donor_name} 
                        current={entry.current} 
                        played={entry.played} 
                        />
                    </div>
                    <LikeBlock like_state={queueLikes[curIndex]}
                    user_id={userData.id}
                    song_id={entry.id} 
                    like_count={entry.like_count} 
                    clickLikeHandler={clickLikeHandler} />
                </div>
                );
            }
            ))
        }
    }, [queueData, queueLikes, userData.id, userData.is_mod, changeQueueEntry, deleteQueueEntry, clickLikeHandler, changeModView]);

    const SERVER_URL = `https://${BACKEND_ADDRESS}:5200`;

    useEffect(() => {
        getQueue();
    },[getQueue]);

    useEffect(() => {
        if(userData.is_admin){
            getRequest('admin/getFontSize', '5100')
            .then(response => response.json())
            .then(data => setCurFontSize(data.fontSize));
        }
    },[userData.is_admin]);

    useEffect(() => {
        const socket = io(SERVER_URL);

        if(userData.is_admin){
            socket.emit('sub admin', userData.display_name);
        }
        socket.on('connected', (data) => {
            setIsLive(data);
        });
        socket.on('queue change', (data) => {
            setQueueData(data.songs.map((song: DBQueueEntry) => (queueDBtoData(song))));
            getCurLikes();
        });
        socket.on('queue status', (data) => {
            setIsLive(data);
        });
        socket.on('max display changed', (data) => {
            setMaxDisplay(data);
        });
        socket.on('font size changed', (data) => {
            setCurFontSize(data);
        });
        socket.on('show info text', (data) => {
            setShowInfo(data);
        });
        socket.on('change info text', (data) => {
            setInfoText(data);
        });
        return (() => {
            socket.disconnect();
        });
    }, [getCurLikes, SERVER_URL, userData.display_name, userData.is_admin]);

    useEffect(() => {
        getCurLikes();
    }, [getCurLikes])

    return (
        <div className="queue-list">
            {userData.is_mod ?
                <div className="chad-view">
                    <DragDropContext onDragEnd={queueHandleOnDragEnd}>
                        <Droppable droppableId="queue">
                            {provided => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    <button className="order-button" onClick={changeQueueOrder}>Order</button>
                                    {queueComponents}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                :
                (isLive && <div className="pleb-view">
                    {queueComponents}
                </div>)
            }
            {userData.is_admin &&
                <div className="admin-menu">
                    <AdminMenu is_admin={userData.is_admin} max_display={maxDisplay} font_size={curFontSize} is_live={isLive} show_info={showInfo} info_text={infoText}/>
                </div>}
            {!userData.is_mod && !userData.is_admin && !isLive && (
            <div className="dead-queue">
                Queue is not live!
                <div>
                    Check out
                    <a rel="noreferrer" target='_blank' href="https://www.twitch.tv/zanuda"><img src={twitchIconPath} alt='twitch icon'/></a>
                    <a rel="noreferrer" target='_blank' href="https://t.me/etzalert"><img src={telegramIconPath} alt='telegram icon'/></a>
                </div>
            </div>)}
        </div>
    );
}


export default Queue;