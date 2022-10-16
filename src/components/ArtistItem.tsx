import React from "react";
import { SongListEntry, UserData } from "../utils/interfaces";
import ListItem from "./ListItem";

interface ArtistItemProps { 
    songs: SongListEntry[], 
    artist: string, 
    userData: UserData, 
    displayAlert: () => void 
};

const ArtistItem: React.FC<ArtistItemProps> = ({ songs, artist, userData, displayAlert }) => {

    const [songElems, setSongElems] = React.useState<any>();

    React.useEffect(() => {
        if (songs) {
            setSongElems(songs.map(entry => <ListItem
                key={entry.id}
                song={entry}
                userData={userData}
                displayAlert={displayAlert}
            />));
        }
    }, [songs, userData, displayAlert])


    return (
        <div className="artist-block">
            <p className="artist-title">{artist}</p>
            {songElems}
        </div>
    );
};

export default ArtistItem;