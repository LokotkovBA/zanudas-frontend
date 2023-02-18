import { useState, useEffect } from "react";

import { DBQueueEntry, SongListEntry, UserData } from "../utils/interfaces";

import pathToThumbsUp from '../icons/thumbs-up-green.svg';
import pathToThumbsDown from '../icons/thumbs-down-red.svg';
import { useMutation } from "react-query";
import { postRequest } from "../utils/api-requests";
import { AxiosError } from "axios";
import { Alert } from "./Alert";

export interface ListItemProps {
    song: SongListEntry, 
    userData: UserData, 
    displayAlert: () => void  
};

const ListItem: React.FC<ListItemProps> = ({ song, userData, displayAlert }) => {
    const [showEditFields, setShowEditFields] = useState<boolean>(false);
    const [songData, setSongData] = useState<SongListEntry>(song);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>("Delete");
    const [clickedState, setClickedState] = useState<string>('');

    const [curLike, setCurLike] = useState<string>(pathToThumbsUp);

    const [alertMessage, setAlertMessage] = useState<string>('');
    const [sliding, setSliding] = useState<string>('sliding');

    const [changeButtonState, setChangeButtonState] = useState<''|'pressed'>('');
    const [addButtonState, setAddButtonState] = useState<''|'pressed'>('');
    const [editButtonState, setEditButtonState] = useState<''|'pressed'>('');
    const [deleteButtonState, setDeleteButtonState] = useState<''|'pressed'>('');

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

    const deleteRequest = useMutation((songId: number) => postRequest('songlist/delete', '5100', {id: songId}), options);
    const addQueueRequest = useMutation((newSong: DBQueueEntry) => postRequest('queue/addsong', '5100', newSong), options);
    const changeSongRequest = useMutation((songData: SongListEntry) => postRequest('songlist/changeall', '5100', songData), options);

    function copyClick(){
        navigator.clipboard.writeText(`${song.artist} - ${song.song_name}`);
        displayAlert();
    };

    function mouseDown(){
        setClickedState('clicked');
    };

    function mouseUp(){
        setClickedState('');
    }

    function toggleEditFields(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        event.stopPropagation();
        setShowEditFields(oldValue => !oldValue);
    };

    function deleteItem(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        event.stopPropagation();
        if(deleteIntention && userData.is_admin){
            deleteRequest.mutate(songData.id!);
        }else{
            setDeleteIntention(true);
            setDeleteButtonText('Sure?');
        }
    };

    useEffect(() =>{
        if(deleteRequest.isSuccess){
            setDeleteIntention(false);
            setDeleteButtonText('Deleted');
        }
    },[deleteRequest.isSuccess]);

    useEffect(() =>{
        if(deleteRequest.isError){
            setDeleteButtonText('Error!');
        }
    },[deleteRequest.isError]);

    function addToQueue(event:  React.MouseEvent<HTMLButtonElement, MouseEvent>){
        event.stopPropagation();
        if(userData.is_mod || userData.is_admin){
            addQueueRequest.mutate({
                artist: song.artist, 
                song_name: song.song_name, 
                donor_name: '', 
                donate_amount: '0', 
                currency: 'RUB', 
                donor_text: '',
                tag: song.tag, 
                queue_number: '0'
            });
        };
    };

    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setSongData(prevSongData => {
            const { name, value } = event.target;
            let newSongData = {...prevSongData, [name]: value};
            return newSongData;
        });
    };

    function sendNewSongData(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        event.stopPropagation();
        if(userData.is_mod || userData.is_admin){
            changeSongRequest.mutate(songData);
        };
    };

    function inputClick(event: React.MouseEvent){
        event.stopPropagation();
    }

    useEffect(() => {
        setCurLike(song.likes > 0 ? pathToThumbsUp : pathToThumbsDown);
    }, [song.likes]);

    return (
        <div className={`list-item ${clickedState}`} onClick={copyClick} onMouseUp={mouseUp} onMouseDown={mouseDown}>
            {!showEditFields && <p className="song-info">{song.song_name}</p>}
            {showEditFields && userData.is_admin && 
            <>
                <input type='text' name='artist' placeholder="artist" onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.artist ? songData.artist : ''} />
                <input type='text' name='song_name' placeholder="song name" className='song-info' onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.song_name ? songData.song_name : ''} />
                <input type='text' name='tag' placeholder="tag" className='song-info' onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.tag ? songData.tag : ''} />
                <button 
                className={changeButtonState}
                onMouseDown={(event) => {
                    event.stopPropagation();
                    setChangeButtonState('pressed');
                }} 
                onMouseUp={(event) => {
                    event.stopPropagation();
                    setChangeButtonState('');
                }} 
                onClick={(event) => sendNewSongData(event)}>Change</button>
            </>}
            {(song.likes !== 0) &&
            <div className='like-text'>
                <img src={curLike} alt='Like' width={18} height={18}/> {song.likes}
            </div>}
            {userData.is_admin &&
            <>
                <button
                className={editButtonState}
                onMouseDown={(event) => {
                    event.stopPropagation();
                    setEditButtonState('pressed');
                }}
                onMouseUp={(event) => {
                    event.stopPropagation();
                    setEditButtonState('');
                }}
                onClick={(event) => toggleEditFields(event)}>Edit</button>
                <button
                className={deleteButtonState}
                onMouseDown={(event) => {
                    event.stopPropagation();
                    setDeleteButtonState('pressed');
                }}
                onMouseUp={(event) => {
                    event.stopPropagation();
                    setDeleteButtonState('');
                }}
                onClick={(event) => deleteItem(event)}>{deleteButtonText}</button>
            </>}
            {(userData.is_admin || userData.is_mod) && 
                <button
                className={addButtonState}
                onMouseDown={(event) => {
                    event.stopPropagation();
                    setAddButtonState('pressed');
                }}
                onMouseUp={(event) =>{
                    event.stopPropagation();
                    setAddButtonState('');
                }}
                onClick={(event) => addToQueue(event)}>Add</button>}
            <Alert message={alertMessage} class_name={`alert fetch ${sliding}`}/>
        </div>
    );
}

export default ListItem;