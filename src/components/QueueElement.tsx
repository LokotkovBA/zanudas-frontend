import React from 'react'
import { LikesState, QueueEntry } from '../utils/interfaces';
import { LikeBlock } from './LikeBlock';
import { QueueItemInfo } from './QueueItemInfo';
import pathToArrowRight from '../icons/arrow-right.svg';

interface QueueElementProps {
    user_id: number;
    like_count: number;
    index: number;
    entry: QueueEntry;
    user_likes: LikesState[];
    click_like_handler: (song_id: number, is_positive: number, index: number) => void;
}

export const QueueElement: React.FC<QueueElementProps> = ({
    user_id,
    like_count,
    index,
    entry,
    user_likes,
    click_like_handler
}) => {
    const curLikeIndex = user_likes.findIndex(like => like.song_id === entry.id);
        return (
        <li className="list-item queue">
            <div className="arrow-info-block">
            {entry.current && <img src={pathToArrowRight} alt="arrow pointing right" height={40} width={24}/>}
                <QueueItemInfo index={index} 
                artist={entry.artist} 
                song_name={entry.song_name} 
                currency={entry.currency} 
                donate_amount={entry.donate_amount} 
                donor_name={entry.donor_name} 
                current={entry.current} 
                played={entry.played} 
                />
            </div>
            <LikeBlock like_state={user_likes[curLikeIndex]}
            user_id={user_id}
            song_id={entry.id} 
            like_count={like_count} 
            clickLikeHandler={click_like_handler} 
            index={index}
            />
        </li>
        );
}