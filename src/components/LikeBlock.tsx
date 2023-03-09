import React from 'react';
import { LikesState } from '../pages/Queue';

import pathToThumbsUp from '../icons/thumbs-up.svg';
import pathToThumbsUpWhite from '../icons/thumbs-up-white.svg';
import pathToThumbsDown from '../icons/thumbs-down.svg';
import pathToThumbsDownWhite from '../icons/thumbs-down-white.svg';

interface LikeBlockProps {
    user_id: number;
    song_id: number;
    like_count: number;
    like_state: LikesState;
    clickLikeHandler: (song_id: number, is_positive: number, index: number) => void;
    index: number;
}

export const LikeBlock: React.FC<LikeBlockProps> = ({ user_id, song_id, like_count, like_state, clickLikeHandler, index }) => {
    return (
        <div className="reaction">
            <p className="reaction__count">{like_count}</p>
            <div className="actions">
                <img width={24} height={24} alt="thumbs up" className={`actions__action--${user_id ? '' : 'not'}clickable`} src={(like_state?.is_positive === 1) ? pathToThumbsUp : pathToThumbsUpWhite}
                    onClick={() => clickLikeHandler(song_id, like_state.is_positive === 1 ? 0 : 1, index)} />
                <img width={24} height={24} alt="thumbs down" className={`actions__action--${user_id ? '' : 'not'}clickable`} src={(like_state?.is_positive === -1) ? pathToThumbsDown : pathToThumbsDownWhite}
                    onClick={() => clickLikeHandler(song_id, like_state.is_positive === -1 ? 0 : -1, index)} />
            </div>
        </div>
    );
};
