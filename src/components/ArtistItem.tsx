import React from "react";
import { SongListEntry } from "../utils/interfaces";
import ListItem from "./ListItem";

const ArtistItem: React.FC<{songs: SongListEntry[], artist: string}> = ({songs, artist}) => {
    
    const [songElems, setSongElems] = React.useState<any>();

    React.useEffect(()=>{
        if(songs){
            setSongElems(songs.map(entry => <ListItem 
                key={entry.id} 
                song={entry}
                />));
        }
    },[songs])


    return (
        <div className="artist-block">
            <p className="artist-title">{artist}</p>
            {songElems}
        </div>
    );
}

export default ArtistItem;