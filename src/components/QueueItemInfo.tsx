import React from 'react';

interface QueueItemInfoProps {
    index: number;
    artist: string;
    song_name: string;
    donate_amount: number;
    currency: string;
    donor_name: string;
    played: boolean;
    current: boolean;
}

export const QueueItemInfo: React.FC<QueueItemInfoProps> = ({ index, artist, song_name, donate_amount, currency, donor_name, played, current }) => {
    return (
        <div className={(played ? 'played ' : (current ? 'current ' : '')) + 'queue-item-info'}>
            <p className="queue-num">{index + 1}</p>
            <div>
                <p>{artist} - {song_name}</p>
                {donate_amount > 0 && <>{donate_amount} {currency} </>}
                {donor_name && <>from <b>{donor_name}</b></>}
            </div>
        </div>);
};
