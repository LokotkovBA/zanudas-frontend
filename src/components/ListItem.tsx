import { useState } from "react";

import { SongListEntry, UserData } from "../utils/interfaces";
import { postRequest } from "../utils/api-requests";

const ListItem: React.FC<{ song: SongListEntry, userData: UserData  }> = ({ song, userData }) => {

    const [showEditFields, setShowEditFields] = useState<boolean>(false);
    const [songData, setSongData] = useState<SongListEntry>(song);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>("Delete");
    function copyClick(){
        navigator.clipboard.writeText(`${song.artist} - ${song.song_name}`);
    };

    function toggleEditFields(){
        setShowEditFields(oldValue => !oldValue);
    };

    function deleteItem(){
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

    function sendNewSongData(){
        postRequest('songlist/changeall', '5100', `{"id": ${songData.id}, "artist": "${songData.artist}", "song_name": "${songData.song_name}"}`);
    }

    return (
        <div className="list-item">
            {!showEditFields && <p className="song-info" onClick={copyClick}>{song.song_name}</p>}
            {showEditFields && userData.is_admin && 
            <>
                <input type='text' name='artist' placeholder="artist" onChange={queueEntryChangeEvent} value={songData.artist ? songData.artist : ''} />
                <input type='text' name='song_name' placeholder="song name" className='song-info' onChange={queueEntryChangeEvent} value={songData.song_name ? songData.song_name : ''} />
                <button onClick={sendNewSongData}>Change</button>
            </>}
            {/* {song.date !== 'old' && <p className="learn-date">First played: {song.date}</p>} */}
            {userData.is_admin &&
            <>
                <button onClick={toggleEditFields}>Edit</button>
                <button onClick={deleteItem}>{deleteButtonText}</button>
            </>}
        </div>
    );
}

export default ListItem;