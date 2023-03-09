import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQuery } from 'react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../utils/api-requests';
import { UserData } from '../App';
import { queueDBtoData } from '../utils/conversions';
import { AdminMenu } from '../components/AdminMenu';
import { socket } from '../utils/socket-client';
import { QueueModElement } from '../components/QueueModElement';
import { QueueElement } from '../components/QueueElement';
import { Alert } from '../components/Alert';
import telegramIconPath from '../icons/telegram.svg';
import twitchIconPath from '../icons/twitch.svg';
import '../css/queue.scss';

let timeoutCount = 0;

const queueEntrySchema = z.object({
    id: z.number(),
    artist: z.string().nullable(),
    song_name: z.string().nullable(),
    donor_name: z.string(),
    donate_amount: z.number(),
    currency: z.string(),
    donor_text: z.string(),
    tag: z.string().nullable(),
    queue_number: z.number(),
    like_count: z.number(),
    played: z.boolean(),
    will_add: z.boolean(),
    visible: z.boolean(),
    current: z.boolean()
});

const queueSchema = z.object({
    songs: z.array(queueEntrySchema),
    max_display: z.number(),
    current: z.number(),
    is_live: z.boolean()
});

const likeSchema = z.object({
    is_positive: z.number(),
    song_id: z.number()
});

const likesSchema = z.object({
    likes: z.array(likeSchema),
    is_empty: z.boolean()
});

export type DBQueueEntry = z.infer<typeof queueEntrySchema>;

export type QueueEntry = DBQueueEntry & {
    mod_view: boolean;
    style: 'simple' | 'complex';
    button_text: 'More' | 'Hide';
    classN?: string;
    delete_intention: boolean;
    delete_button_text: 'Delete' | 'Sure?' | 'Error!';
}

export type LikesState = z.infer<typeof likeSchema>;

const Queue: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [queueData, setQueueData] = useState<QueueEntry[]>([]);
    const [queueLikes, setQueueLikes] = useState<LikesState[]>([]);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [sliding, setSliding] = useState<boolean>(false);

    const [isLive, setIsLive] = useState<boolean>(false);

    const { isLoading, isError, isSuccess } = useQuery(['queue-data'], async () => queueSchema.parse((await getRequest('queue', '5100')).data), {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            setQueueData(data.songs.map((entry) => queueDBtoData(entry)));
            setIsLive(data.is_live);
        }
    });

    const options = useMemo(() => {
        return {
            onError: (error: AxiosError) => {
                setAlertMessage(error.message);
                setSliding(true);
            },
            onSuccess: () => {
                setSliding(true);
                setAlertMessage('Success!');
                timeoutCount++;
                setTimeout(() => {
                    timeoutCount--;
                    if (!timeoutCount) {
                        setSliding(false);
                    }
                }, 3000);
            }
        };
    }, []);

    const queueChangeRequest = useMutation((newQueueData: { queueEntry: QueueEntry, index: number }) => patchRequest(`queue?index=${newQueueData.index}`, '5100', newQueueData.queueEntry), options);

    const deleteQueueEntryRequest = useMutation((delEntry: { id: number; index: number }) => deleteRequest('queue', '5100', { id: delEntry.id, index: delEntry.index }), {
        onError: (error, delEntry) => {
            setQueueData(prevQueueData => {
                const newQueueData = [...prevQueueData];
                newQueueData[delEntry.index].delete_button_text = 'Error!';
                newQueueData[delEntry.index].delete_intention = true;
                return newQueueData;
            });
        }
    });

    function changeDeleteIntention(del_index: number, text: 'Delete' | 'Sure?' | 'Error!', delete_intention: boolean) {
        setQueueData(prevQueueData => {
            const newQueueData = [...prevQueueData];
            newQueueData[del_index].delete_button_text = text;
            newQueueData[del_index].delete_intention = delete_intention;
            return newQueueData;
        });
    }

    function changeModView(index: number) {
        setQueueData(prevQueueData => {
            const newQueuedata = [...prevQueueData];
            newQueuedata[index].mod_view = !prevQueueData[index].mod_view;
            newQueuedata[index].style = newQueuedata[index].mod_view ? 'complex' : 'simple';
            newQueuedata[index].button_text = newQueuedata[index].mod_view ? 'Hide' : 'More';
            return newQueuedata;
        });
    }

    useQuery(['likes-data'], async () => likesSchema.parse((await getRequest('queue/likes', '5100')).data), {
        enabled: userData.display_name !== '',
        onSuccess: (data) => {
            if (data.is_empty) {
                setQueueLikes([]);
            } else {
                setQueueLikes(data.likes);
            }
        },
        refetchOnWindowFocus: false
    });

    const addLikeRequest = useMutation((likeData: { song_id: number, is_positive: number, song_index: number }) => postRequest('queue/like', '5100', { song_id: likeData.song_id, is_positive: likeData.is_positive, song_index: likeData.song_index }));

    function clickLikeHandler(song_id: number, is_positive: number, index: number) {
        if (userData.display_name) {
            addLikeRequest.mutate({ song_id: song_id, is_positive: is_positive, song_index: index });
        }
    }

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
    }

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
    }

    function queueHandleOnDragEnd(result: DropResult) {
        if (result.destination) {
            setQueueData(prevQueueData => {
                const newOrder = [...prevQueueData];
                const [reorderedEntry] = newOrder.splice(result.source.index, 1);
                newOrder.splice(result.destination!.index, 0, reorderedEntry);
                changeQueueOrder(newOrder);
                return newOrder;
            });
        }
    }

    const queueOrderRequest = useMutation((newOrder: { id: number, queue_number: number }[]) => patchRequest('queue/order', '5100', newOrder), options);

    const changeQueueOrder = useCallback((queue_data: QueueEntry[]) => {
        const newOrder = queue_data.map((elem, index) => ({ id: elem.id, queue_number: index }));
        setQueueData(prevQueueData => prevQueueData.map((elem, index) => ({ ...elem, queue_number: index, classN: '' })));
        queueOrderRequest.mutate(newOrder);
    }, [queueOrderRequest]);

    useEffect(() => {
        socket.on('queue status', (data) => {
            setIsLive(data);
        });
        socket.on('queue change', (data) => {
            setQueueData(data.songs.map((song: DBQueueEntry) => (queueDBtoData(song))));
        });
        socket.on('song likes change', ({ count, song_index }) => {
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                newQueueData[song_index].like_count = count;
                return newQueueData;
            });
        });
        socket.on('queue entry change', ({ index, entry }) => {
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                entry = {
                    ...entry,
                    classN: '',
                    button_text: 'More',
                    mod_view: false,
                    style: 'simple-view',
                };
                newQueueData[index] = entry;
                return newQueueData;
            });
        });
        socket.on('new current', ({ index }) => {
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                newQueueData.forEach((entry, entryIndex) => {
                    if (index !== entryIndex) {
                        entry.current = false;
                    }
                });
                return newQueueData;
            });
        });
        socket.on('queue entry add', ({ entry }) => {
            const newEntry: QueueEntry = {
                like_count: 0,
                played: false,
                will_add: false,
                visible: false,
                current: false,
                mod_view: false,
                style: 'simple-view',
                button_text: 'More',
                delete_intention: false,
                delete_button_text: 'Delete',
                ...entry
            };
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                newQueueData.push(newEntry);
                return newQueueData;
            });
        });

        socket.on('queue order update', ({ order }: { order: { id: number, queue_number: number }[] }) => {
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                const bufferQueueData = [...oldQueueData];
                for (const song of order) {
                    for (let i = 0; i < bufferQueueData.length; i++) {
                        if (bufferQueueData[i].id === song.id) {
                            newQueueData[song.queue_number] = bufferQueueData[i];
                            bufferQueueData.splice(i, 1);
                            break;
                        }
                    }
                }
                return newQueueData;
            });
        });
        return (() => {
            socket.off('queue status');
            socket.off('queue change');
            socket.off('song likes change');
            socket.off('queue entry change');
            socket.off('new current');
            socket.off('queue entry add');
            socket.off('queue order update');
        });
    }, []);

    useEffect(() => {
        socket.on('queue entry delete', ({ index }) => {
            setQueueData(oldQueueData => {
                const newQueueData = [...oldQueueData];
                newQueueData.splice(index, 1);
                changeQueueOrder(newQueueData);
                return newQueueData;
            });
        });
        return (() => {
            socket.off('queue entry delete');
        });
    }, [changeQueueOrder]);

    useEffect(() => {
        if (userData.display_name) {
            socket.on('likes change', (likes: LikesState[]) => {
                setQueueLikes(likes);
            });
            socket.on('connect', () => {
                socket.emit('sub likes', userData.display_name);
            });
            socket.emit('sub likes', userData.display_name);
        }
        return (() => {
            socket.emit('unsub likes', userData.display_name);
            socket.off('likes change');
            socket.off('connect');
        });
    }, [userData.display_name]);

    if (isLoading) {
        return (
            <div className="loader">
                <div className="loader__circle" />
            </div>);
    }

    return (
        <>
            {userData.is_mod ?
                <DragDropContext onDragEnd={queueHandleOnDragEnd}>
                    <Droppable droppableId="queue">
                        {provided => (
                            <ul className="queue queue--mod" {...provided.droppableProps} ref={provided.innerRef}>
                                {queueData.map((entry, index) => <QueueModElement
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
                                />)}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
                :
                (isLive && <ul className="queue queue--pleb">
                    {queueData.filter((entry) => entry.visible).map((entry, index) => {
                        return (<QueueElement
                            entry={entry}
                            like_count={entry.like_count}
                            queue_number={entry.queue_number}
                            index={index}
                            user_id={userData.id}
                            user_likes={queueLikes}
                            click_like_handler={clickLikeHandler}
                            key={entry.id}
                        />);
                    })}
                </ul>)
            }
            {userData.is_admin &&
                <AdminMenu
                    display_name={userData.display_name}
                    is_admin={userData.is_admin}
                    is_live={isLive}
                />}
            {isSuccess && !userData.is_mod && !userData.is_admin && !isLive && (
                <div className="alert alert--error">
                    Queue is not live!
                    <div className="alert__referrals">
                        Check out
                        <a rel="noreferrer" target="_blank" href="https://www.twitch.tv/zanuda"><img src={twitchIconPath} alt="twitch icon" width={30} height={30} /></a>
                        <a rel="noreferrer" target="_blank" href="https://t.me/etzalert"><img src={telegramIconPath} alt="telegram icon" width={30} height={30} /></a>
                    </div>
                </div>)}
            {isError && <Alert message="Couldn't load queue!" class_name="alert alert--error" />}
            <Alert class_name={`alert alert--fetch${sliding ? ' alert--sliding' : ''}`} message={alertMessage} />
        </>
    );
};


export default Queue;
