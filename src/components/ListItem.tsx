import React, { useState, useMemo } from 'react';
import { useMutation } from 'react-query';
import { AxiosError } from 'axios';

import { deleteRequest, patchRequest, postRequest } from '../utils/api-requests';
import { Alert } from './Alert';
import { DBQueueEntry } from '../pages/Queue';
import { SongListEntry } from '../pages/SongList';
import { UserData } from '../App';

import pathToThumbsUp from '../icons/thumbs-up-green.svg';
import pathToThumbsDown from '../icons/thumbs-down-red.svg';

export interface ListItemProps {
    song: SongListEntry,
    userData: UserData,
    displayAlert: () => void
}

const ListItem: React.FC<ListItemProps> = ({ song, userData, displayAlert }) => {
    const [showEditFields, setShowEditFields] = useState<boolean>(false);
    const [songData, setSongData] = useState<SongListEntry>(song);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>('Delete');
    const [clickedState, setClickedState] = useState(false);

    const [alertMessage, setAlertMessage] = useState<string>('');
    const [sliding, setSliding] = useState<boolean>(false);

    const [changeButtonState, setChangeButtonState] = useState<boolean>(false);
    const [addButtonState, setAddButtonState] = useState<boolean>(false);
    const [editButtonState, setEditButtonState] = useState<boolean>(false);
    const [deleteButtonState, setDeleteButtonState] = useState<boolean>(false);

    const options = useMemo(() => {
        return {
            onError: (error: AxiosError) => {
                setAlertMessage(error.message);
                setSliding(true);
            },
            onSuccess: () => {
                setSliding(true);
                setAlertMessage('Success!');
                setTimeout(() => {
                    setSliding(false);
                }, 1000);
            }
        };
    }, []);

    const deleteSongRequest = useMutation((songId: number) => deleteRequest('songlist', '5100', { id: songId }), {
        onSuccess: () => {
            options.onSuccess();
            setDeleteIntention(false);
            setDeleteButtonText('Deleted');
        },
        onError: (error: AxiosError) => {
            options.onError(error);
            setDeleteButtonText('Error!');
        }
    });
    const addQueueRequest = useMutation((newSong: DBQueueEntry) => postRequest('queue', '5100', newSong), options);
    const changeSongRequest = useMutation((songData: SongListEntry) => patchRequest(`songlist?id=${songData.id}`, '5100', songData), options);

    function copyClick() {
        navigator.clipboard.writeText(`${song.artist} - ${song.song_name}`);
        displayAlert();
    }

    function toggleEditFields(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.stopPropagation();
        setShowEditFields(oldValue => !oldValue);
    }

    function deleteItem(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.stopPropagation();
        if (deleteIntention && userData.is_admin) {
            deleteSongRequest.mutate(songData.id!);
        } else {
            setDeleteIntention(true);
            setDeleteButtonText('Sure?');
        }
    }

    function addToQueue(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.stopPropagation();
        if (userData.is_mod || userData.is_admin) {
            addQueueRequest.mutate({
                id: 0,
                artist: song.artist,
                song_name: song.song_name,
                donor_name: '',
                donate_amount: 0,
                currency: 'RUB',
                donor_text: '',
                tag: song.tag,
                queue_number: 0,
                like_count: 0,
                played: false,
                will_add: false,
                visible: false,
                current: false
            });
        }
    }

    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setSongData(prevSongData => {
            const { name, value } = event.target;
            const newSongData = { ...prevSongData, [name]: value };
            return newSongData;
        });
    }

    function sendNewSongData(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.stopPropagation();
        if (userData.is_mod || userData.is_admin) {
            changeSongRequest.mutate(songData);
        }
    }

    function inputClick(event: React.MouseEvent) {
        event.stopPropagation();
    }

    return (
        <div className={`entry ${clickedState ? 'entry--clicked' : ''} ${showEditFields ? 'entry--edit' : ''}`}
            onClick={copyClick} onMouseUp={() => setClickedState(false)} onMouseDown={() => setClickedState(true)}>
            {!showEditFields && <p>{song.song_name}</p>}
            {showEditFields && userData.is_admin &&
                <>
                    <div className="entry__editfields">
                        <input className="admin-input" type="text" name="artist" placeholder="artist" onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.artist ? songData.artist : ''} />
                        <label htmlFor="artist">Artist</label>
                        <input className="admin-input" type="text" name="song_name" placeholder="entry name" onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.song_name ? songData.song_name : ''} />
                        <label htmlFor="song_name">Song name</label>
                        <input className="admin-input" type="text" name="tag" placeholder="tag" onClick={(event) => inputClick(event)} onChange={queueEntryChangeEvent} value={songData.tag ? songData.tag : ''} />
                        <label htmlFor="tag">Tag</label>
                    </div>
                    <button
                        type="button"
                        className={`button${changeButtonState ? ' button--pressed' : ''}`}
                        onMouseDown={(event) => {
                            event.stopPropagation();
                            setChangeButtonState(true);
                        }}
                        onMouseUp={(event) => {
                            event.stopPropagation();
                            setChangeButtonState(false);
                        }}
                        onClick={(event) => sendNewSongData(event)}>Change</button>
                </>}
            {(song.likes !== 0) &&
                <div className="entry__likeinfo">
                    <img src={song.likes > 0 ? pathToThumbsUp : pathToThumbsDown} alt="Like" width={18} height={18} /> {song.likes}
                </div>}
            {userData.is_mod &&
                <div className="entry__modbuttons">
                    {userData.is_admin &&
                        <>
                            <button
                                type="button"
                                className={`button${editButtonState ? ' button--pressed' : ''}`}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    setEditButtonState(true);
                                }}
                                onMouseUp={(event) => {
                                    event.stopPropagation();
                                    setEditButtonState(false);
                                }}
                                onClick={(event) => toggleEditFields(event)}>
                                Edit
                            </button>
                            <button
                                type="button"
                                className={`button${deleteButtonState ? ' button--pressed' : ''}`}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    setDeleteButtonState(true);
                                }}
                                onMouseUp={(event) => {
                                    event.stopPropagation();
                                    setDeleteButtonState(false);
                                }}
                                onClick={(event) => deleteItem(event)}>
                                {deleteButtonText}
                            </button>
                        </>}
                    <button
                        type="button"
                        className={`button${addButtonState ? ' button--pressed' : ''}`}
                        onMouseDown={(event) => {
                            event.stopPropagation();
                            setAddButtonState(true);
                        }}
                        onMouseUp={(event) => {
                            event.stopPropagation();
                            setAddButtonState(false);
                        }}
                        onClick={(event) => addToQueue(event)}>Add</button>
                </div>}
            <Alert message={alertMessage} class_name={`alert alert--fetch${sliding ? 'alert--sliding' : ''}`} />
        </div>
    );
};

export default ListItem;
