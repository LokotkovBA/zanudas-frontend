import React from 'react';
import { LikeBlock } from './LikeBlock';
import { QueueItemInfo } from './QueueItemInfo';
import { LikesState, QueueEntry } from '../pages/Queue';

interface QueueElementProps {
    like_count: number;
    queue_number: number;
    index: number;
    entry: QueueEntry;
    user_like: LikesState | undefined;
    click_like_handler: (song_id: number, is_positive: number, index: number) => void;
}

export const QueueElement: React.FC<QueueElementProps> = ({
    like_count,
    queue_number,
    index,
    entry,
    user_like,
    click_like_handler
}) => {
    return (
        <li className="item item--pleb">
            <QueueItemInfo index={index}
                artist={entry.artist}
                song_name={entry.song_name}
                currency={entry.currency}
                donate_amount={entry.donate_amount}
                donor_name={entry.donor_name}
                current={entry.current}
                played={entry.played}
            />
            <LikeBlock like_state={user_like}
                song_id={entry.id}
                like_count={like_count}
                clickLikeHandler={click_like_handler}
                index={queue_number}
            />
        </li>
    );
};
