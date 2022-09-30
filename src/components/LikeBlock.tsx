import React from 'react'

interface LikeBlockProps {
    song_id: number;
    like_count: number;
    like_src: any;
    dislike_src: any;
    white_like_src: any;
    white_dislike_src: any;
    clickLikeHandler: (song_id: number, is_positive: number) => void;
}

export const LikeBlock: React.FC<LikeBlockProps> = ({ song_id, like_count, like_src, dislike_src, white_like_src, white_dislike_src, clickLikeHandler}) => {
        return (
            <div className="reaction">
                <p className="like-count">{like_count}</p>
                <div className="reaction-buttons">
                    <img src={like_src} onClick={() => {
                        if (like_src === white_like_src) {
                            clickLikeHandler(song_id, 1);
                        } else {
                            clickLikeHandler(song_id, 0);
                        }
                    }} alt='thumbs up' />
                    <img src={dislike_src} onClick={() => {
                        if (dislike_src === white_dislike_src) {
                            clickLikeHandler(song_id, -1);
                        } else {
                            clickLikeHandler(song_id, 0);
                        }
                    }} alt='thumbs down' />
                </div>
            </div>
        );
}