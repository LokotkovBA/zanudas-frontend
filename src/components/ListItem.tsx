import { SongListEntry } from "../utils/interfaces";

const ListItem: React.FC<{song: SongListEntry}> = ({song}) =>{
    return (
        <div className="list-item">
            <p className="song-info">{song.song_name}</p>
            {song.date !== 'old' && <p className="learn-date">First played: {song.date}</p>}
        </div>
    );
}

export default ListItem;