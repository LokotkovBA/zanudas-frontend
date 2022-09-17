import React from "react";

import { SongListEntry } from "../utils/interfaces";

const ListItem: React.FC<{ song: SongListEntry }> = ({ song }) => {

    const [buttonText, setButtonText] = React.useState('Copy');
    function copyClick(){
        navigator.clipboard.writeText(`${song.artist} - ${song.song_name}`);
        setButtonText("Copied");
    };

    return (
        <div className="list-item">
            <p className="song-info">{song.song_name}</p>
            {/* {song.date !== 'old' && <p className="learn-date">First played: {song.date}</p>} */}
            <button className="copy-button" onClick={copyClick}>{buttonText}</button>
        </div>
    );
}

export default ListItem;