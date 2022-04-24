import { DragDropContext, Draggable, Droppable, DropResult } from "@react-forked/dnd";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getRequest, postRequest } from "../utils/api-requests";
import { DBLikesState, DBQueueEntry, LikesState, QueueEntry, UserData } from "../utils/interfaces";

import pathToThumbsUp from '../icons/thumbs-up.svg';
import pathToThumbsUpWhite from '../icons/thumbs-up-white.svg';
import pathToThumbsDown from '../icons/thumbs-down.svg';
import pathToThumbsDownWhite from '../icons/thumbs-down-white.svg';
import { queueDBtoData } from "../utils/conversions";

const Queue: React.FC<{userData: UserData}> = ({userData}) =>{
    const [queueData, setQueueData] = useState<QueueEntry[]>([]);
    const [queueComponents, setQueueComponents] = useState<JSX.Element[]>([]);
    const [queueLikes, setQueueLikes] = useState<LikesState[]>([]);

    function getQueue(){
        getRequest('queue/get','5100')
        .then(response => response.json())
        .then(data => 
            setQueueData(data.songs.map((song: DBQueueEntry) => queueDBtoData(song))));
    };

    const changeQueueEntry = useCallback((entryId: number) =>{
        const curIndex = queueData.findIndex(entry => entry.id === entryId);
        postRequest('queue/change', '5100', JSON.stringify(queueData[curIndex]));
    },[queueData]);

    const deleteQueueEntry = useCallback((entryId: number) =>{
        const delIndex = queueData.findIndex(entry => entry.id === entryId);
        setQueueData(prevQueueData => {
            let newQueueData = [...prevQueueData];
            newQueueData.splice(delIndex, 1);
            return newQueueData;
        })
        postRequest('queue/delete', '5100', JSON.stringify({id: entryId}));
    },[queueData]);

    const getCurLikes = useCallback(() =>{
        if(userData.display_name){
            getRequest('queue/getAllLikes', '5100')
            .then(response => response.json())
            .then(data => {
                if(data.is_empty){
                    setQueueLikes([]);
                }else{
                    setQueueLikes(data.map((like: DBLikesState) => ({...like, song_id: parseInt(like.song_id)})));
                }
            });
        }
    },[userData.display_name]);

    const clickLikeHandler = useCallback((song_id: number, is_positive: number) => {
        if(userData.display_name){
            postRequest('queue/addLike', '5100', JSON.stringify({song_id: song_id, is_positive: is_positive}))
        }
    },[userData.display_name]);


    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>){
        setQueueData(prevQueueData =>{
            const {name, value, className, type, checked} = event.target;
            const curIndex = prevQueueData.findIndex(entry => entry.id === parseInt(className));
            return prevQueueData.map((entry, index) =>{
                return index === curIndex ? {
                    ...entry, 
                    [name]: type === 'checkbox' ? checked : value
                } : entry;
            });
        });
    };

    function queueEntryTextAreaChangeEvent(event: React.ChangeEvent<HTMLTextAreaElement>){
        setQueueData(prevQueueData =>{
            const {name, value, className} = event.target;
            const curIndex = prevQueueData.findIndex(entry => entry.id === parseInt(className));
            return prevQueueData.map((entry, index) =>{
                return index === curIndex ? {
                    ...entry, 
                    [name]: value
                } : entry;
            });
        });
    }

    function queueHandleOnDragEnd(result: DropResult){
        if(result.destination){
            setQueueData(prevQueueData =>{
                const newOrder = [...prevQueueData];
                const [reorderedEntry] = newOrder.splice(result.source.index, 1);
                reorderedEntry.classN = 'moved';
                newOrder.splice(result.destination!.index, 0, reorderedEntry);
                return newOrder;
            });
        }
    };

    function changeQueueOrder(){
        const newOrder = queueData.map((elem, index) => ({id: elem.id, queue_number: index}));
        setQueueData(prevQueueData => prevQueueData.map((elem, index) => ({...elem, queue_number: index, classN: ''})));
        postRequest('queue/order', '5100', JSON.stringify(newOrder));
    };

    useEffect(() => {
        if(userData.is_mod){
            setQueueComponents(queueData.map((entry, index) => 
                <Draggable  key={entry.id} draggableId={entry.id.toString()} index={index}>
                    {(provided) =>
                        {
                            const curIndex = queueLikes.findIndex(like => like.song_id === entry.id);
                            let curLike = pathToThumbsUpWhite;
                            let curDislike = pathToThumbsDownWhite;
                            if(curIndex !== -1){
                                curLike = queueLikes[curIndex].is_positive === 1 ? pathToThumbsUp : pathToThumbsUpWhite;
                                curDislike = queueLikes[curIndex].is_positive === -1 ? pathToThumbsDown : pathToThumbsDownWhite;
                            }
                            return (
                            <div className={`mod-view ${entry.classN}`} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                <p className="queue-num">{index+1}</p>
                                <input type='text' name='artist' placeholder="artist" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.artist ? entry.artist : ''}/>
                                <input type='text' name='song_name' placeholder="song name" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.song_name ? entry.song_name : ''}/>
                                <input type='text' name='donor_name' placeholder="donor name" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.donor_name}/>
                                <input type='text' name='donate_amount' placeholder="amount" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.donate_amount}/>
                                <input type='text' name='currency' placeholder="currency" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.currency}/>
                                <input type='text' name='tag' placeholder="tag" className={entry.id.toString()} onChange={queueEntryChangeEvent} value={entry.tag ? entry.tag : ''}/>
                                <textarea name='donor_text' className={entry.id.toString()} onChange={queueEntryTextAreaChangeEvent} value={entry.donor_text}/>
                                <div className='button-group'>
                                    <button onClick={() => changeQueueEntry(entry.id)}>Change</button>
                                    <button onClick={() => deleteQueueEntry(entry.id)}>Delete</button>
                                </div>
                                <div className="last-block">
                                    <div className="reaction">
                                        <p className="like-count">{entry.like_count}</p>
                                        <div className="reaction-buttons">
                                            <img src={curLike} onClick={() => {
                                                if(curLike === pathToThumbsUpWhite){
                                                    clickLikeHandler(entry.id, 1);
                                                }else{
                                                    clickLikeHandler(entry.id, 0);
                                                }
                                            }} alt='thumbs up'/>
                                            <img src={curDislike} onClick={() => {
                                                if(curDislike === pathToThumbsDownWhite){
                                                    clickLikeHandler(entry.id, -1);
                                                }else{
                                                    clickLikeHandler(entry.id, 0);
                                                }
                                            }} alt='thumbs down'/>
                                        </div>
                                    </div>
                                    <div className="checkboxes">
                                            <input type='checkbox' className={entry.id.toString()} name='played' checked={entry.played} onChange={queueEntryChangeEvent}/>
                                            <label htmlFor='played'>played</label> {/*если сыграно, то нельзя менять порядок */}
                                            <input type='checkbox' className={entry.id.toString()} name='will_add' checked={entry.will_add} onChange={queueEntryChangeEvent}/>
                                            <label htmlFor='will_add'>will add</label>
                                    </div>
                                </div>
                            </div>);
                        }
                    }
                </Draggable>
                ));
        }else{
            setQueueComponents(queueData.filter(entry => entry.artist).map((entry, index) => 
            {
                const curIndex = queueLikes.findIndex(like => like.song_id === entry.id);
                let curLike = pathToThumbsUpWhite;
                let curDislike = pathToThumbsDownWhite;
                if(curIndex !== -1){
                    curLike = queueLikes[curIndex].is_positive === 1 ? pathToThumbsUp : pathToThumbsUpWhite;
                    curDislike = queueLikes[curIndex].is_positive === -1 ? pathToThumbsDown : pathToThumbsDownWhite;
                }
                return (<div className="list-item queue" key={entry.id}>
                    <div className="queue-item-info">
                        <p className="queue-num">{index + 1}</p>
                        <p>{entry.artist} - {entry.song_name}</p>
                        <p>{entry.donate_amount} {entry.currency} from <b>{entry.donor_name}</b></p>
                    </div>
                    <div className="reaction">
                        <p className="like-count">{entry.like_count}</p>
                        <div className="reaction-buttons">
                            <img src={curLike} onClick={() => {
                                if(curLike === pathToThumbsUpWhite){
                                    clickLikeHandler(entry.id, 1);
                                }else{
                                    clickLikeHandler(entry.id, 0);
                                }
                            }} alt='thumbs up'/>
                            <img src={curDislike} onClick={() => {
                                if(curDislike === pathToThumbsDownWhite){
                                    clickLikeHandler(entry.id, -1);
                                }else{
                                    clickLikeHandler(entry.id, 0);
                                }
                            }} alt='thumbs down'/>
                        </div>
                    </div>
                </div>);
            }
            ))
        }
    },[queueData, queueLikes, userData.is_mod, changeQueueEntry, deleteQueueEntry, clickLikeHandler]);

    const SERVER_URL = 'http://localhost:5200';
    
    useEffect(() => {
        getQueue();
        const socket = io(SERVER_URL);
        socket.on('queue change',(data) => {
            setQueueData(data.songs.map((song: DBQueueEntry) => (queueDBtoData(song))));
            getCurLikes();
        });
        // socket.on('queue status')
        return (() => {
            socket.disconnect();
        })
    },[getCurLikes]);

    useEffect(() =>{
        getCurLikes();
    },[getCurLikes])

    return (
        <div className="queue-list">
            {userData.is_mod ?
                <div className="chad-view">
                <DragDropContext onDragEnd={queueHandleOnDragEnd}>
                    <Droppable droppableId="queue">
                        {provided => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <button className="order-button"  onClick={changeQueueOrder}>Order</button>
                                {queueComponents}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                </div>
                :
                (<div className="pleb-view">
                    {queueComponents}
                </div>)
            }
        </div>
    );
}


export default Queue;