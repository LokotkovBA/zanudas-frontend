import React from 'react';
import { SongListEntry } from '../pages/SongList';
import ListItem from './ListItem';

interface ArtistItemProps {
    songs: SongListEntry[],
    artist: string,
    displayAlert: () => void
}

const ArtistItem: React.FC<ArtistItemProps> = ({ songs, artist, displayAlert }) => {

    return (
        <div className="artist">
            {artist}
            {songs.map(entry => <ListItem
                key={entry.id}
                song={entry}
                displayAlert={displayAlert}
            />)}
        </div>
    );
};

export default ArtistItem;
