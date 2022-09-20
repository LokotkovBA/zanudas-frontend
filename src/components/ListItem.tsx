import { useState, useEffect } from "react";

import { SongListEntry, UserData } from "../utils/interfaces";
import { postRequest } from "../utils/api-requests";

import pathToThumbsUp from '../icons/thumbs-up-green.svg';
import pathToThumbsDown from '../icons/thumbs-down-red.svg';

const ListItem: React.FC<{ song: SongListEntry, userData: UserData  }> = ({ song, userData }) => {

    const [showEditFields, setShowEditFields] = useState<boolean>(false);
    const [songData, setSongData] = useState<SongListEntry>(song);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>("Delete");
    const [clickedState, setClickedState] = useState<string>('');

    const [curLike, setCurLike] = useState<string>(pathToThumbsUp);

    function copyClick(){
        navigator.clipboard.writeText(`${song.artist} - ${song.song_name}`);
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
        if(deleteIntention){
            postRequest('songlist/delete', '5100', `{"id": ${songData.id}}`);
            setDeleteIntention(false);
            setDeleteButtonText('Deleted');
        }else{
            setDeleteIntention(true);
            setDeleteButtonText('Sure?');
        }
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
        postRequest('songlist/changeall', '5100', `{"id": ${songData.id}, "artist": "${songData.artist}", "song_name": "${songData.song_name}"}`);
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
                <button onClick={(event) => sendNewSongData(event)}>Change</button>
            </>}
            {(song.likes !== 0) &&
            <div className='like-text'>
                <img src={curLike} alt='Like'/> {song.likes}
            </div>}
            {userData.is_admin &&
            <>
                <button onClick={(event) => toggleEditFields(event)}>Edit</button>
                <button onClick={(event) => deleteItem(event)}>{deleteButtonText}</button>
            </>}
        </div>
    );
}

export default ListItem;