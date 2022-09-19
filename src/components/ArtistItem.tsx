import React from "react";
import { SongListEntry, UserData } from "../utils/interfaces";
import ListItem from "./ListItem";

const ArtistItem: React.FC<{ songs: SongListEntry[], artist: string, userData: UserData }> = ({ songs, artist, userData }) => {

    const [songElems, setSongElems] = React.useState<any>();

    React.useEffect(() => {
        if (songs) {
            setSongElems(songs.map(entry => <ListItem
                key={entry.id}
                song={entry}
                userData={userData}
            />));
        }
    }, [songs, userData])


    return (
        <div className="artist-block">
            <p className="artist-title">{artist}</p>
            {songElems}
        </div>
    );
}

export default ArtistItem;