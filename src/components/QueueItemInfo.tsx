import React from 'react';
import pathToArrowRight from '../icons/arrow-right.svg';

interface QueueItemInfoProps {
    index: number;
    artist: string | null;
    song_name: string | null;
    donate_amount: number;
    currency: string;
    donor_name: string;
    played: boolean;
    current: boolean;
}

export const QueueItemInfo: React.FC<QueueItemInfoProps> = ({ index, artist, song_name, donate_amount, currency, donor_name, played, current }) => {
    return (
        <div className={`info`}>
            {current && <img src={pathToArrowRight} alt="arrow pointing right" height={40} width={24} />}
            <p className="info__number">{index + 1}</p>
            <div className={`info__text info__text--${played ? 'played' : ''} info__text--${current ? 'current' : ''}`}>
                <p>{artist} - {song_name}</p>
                {donate_amount > 0 && <>{donate_amount} {currency} </>}
                {donor_name && <>from <b>{donor_name}</b></>}
            </div>
        </div>);
};
