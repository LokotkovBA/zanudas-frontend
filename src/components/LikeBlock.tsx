import React, { useEffect, useState } from 'react'
import { LikesState } from '../utils/interfaces';

interface LikeBlockProps {
    user_id: number;
    song_id: number;
    like_count: number;
    like_state: LikesState;
    clickLikeHandler: (song_id: number, is_positive: number) => void;
}

export const LikeBlock: React.FC<LikeBlockProps> = ({ user_id, song_id, like_count, like_state, clickLikeHandler}) => {
    const [clickable, setClickable] = useState<string>('');
    const [thumbsUpClicked, setThumbUpClicked] = useState<string>('');
    const [thumbsDownClicked, setThumbDownClicked] = useState<string>('');
    useEffect(() => {
        if(user_id){
            setClickable('clickable');
        }
    },[user_id]);

    useEffect(() =>{
        if(like_state){
            switch(like_state.is_positive){
                case -1:
                    setThumbDownClicked('thumbs-clicked');
                    setThumbUpClicked('');
                    break;
                case 0:
                    setThumbDownClicked('');
                    setThumbUpClicked('');
                    break;
                case 1:
                    setThumbDownClicked('');
                    setThumbUpClicked('thumbs-clicked');
                    break;
                default:
                    setThumbDownClicked('');
                    setThumbUpClicked('');
                    break;
            };
        }
    },[like_state]);

        return (
            <div className="reaction">
                <p className="like-count">{like_count}</p>
                <div className="reaction-buttons">
                    <div className={`${thumbsUpClicked} ${clickable} thumbs-up`} onClick={() => {
                        if (thumbsUpClicked) {
                            clickLikeHandler(song_id, 0);
                            setThumbUpClicked('');
                        } else {
                            clickLikeHandler(song_id, 1);
                            setThumbDownClicked('');
                            setThumbUpClicked('thumbs-clicked');
                        }
                    }}/>
                    <div className={`${thumbsDownClicked} ${clickable} thumbs-down`} onClick={() => {
                        if (thumbsDownClicked) {
                            clickLikeHandler(song_id, 0);
                            setThumbDownClicked('');
                        } else {
                            clickLikeHandler(song_id, -1);
                            setThumbUpClicked('');
                            setThumbDownClicked('thumbs-clicked');
                        }
                    }}/>
                </div>
            </div>
        );
}