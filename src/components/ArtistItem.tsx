import React from 'react';
import { UserData } from '../App';
import { SongListEntry } from '../pages/SongList';
import ListItem from './ListItem';

interface ArtistItemProps {
    songs: SongListEntry[],
    artist: string,
    userData: UserData,
    displayAlert: () => void
}

const ArtistItem: React.FC<ArtistItemProps> = ({ songs, artist, userData, displayAlert }) => {

    return (
        <div className="artist">
            {artist}
            {songs.map(entry => <ListItem
                key={entry.id}
                song={entry}
                userData={userData}
                displayAlert={displayAlert}
            />)}
        </div>
    );
};

export default ArtistItem;
