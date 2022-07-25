import React, { useCallback, useEffect, useState } from "react";
import { getRequest, postRequest } from "../utils/api-requests";
import { formatDate, getFormatDate } from "../utils/date";
import { DBSongListEntry, Filters, SongListEntry, UserData } from "../utils/interfaces";

import ArtistItem from "../components/ArtistItem";
import { Link } from "react-scroll";

const SongList: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [pressedButtons, setPressedButtons] = useState<Filters>({
        foreign: false,
        russian: false,
        ost: false,
        wide_racks: false
    });

    const [artistBlocks, setArtistBlocks] = useState<JSX.Element[]>([]);
    const [letterButtons, setLetterButtons] = useState<JSX.Element[]>([]);

    const [songListData, setSongListData] = useState<SongListEntry[]>([]);
    const [filteredSongListData, setFilteredSongListData] = useState<SongListEntry[]>([]);
    const [showAddField, setShowAddField] = useState(false);
    const [artistList, setArtistList] = useState<string[]>([]);

    const emptyNewSong: SongListEntry = {
        artist: '',
        song_name: '',
        date: getFormatDate(),
        tag: '',
        count: 0
    };

    const [newSongData, setNewSongData] = useState<SongListEntry>(emptyNewSong);

    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const savedSearchTerm = localStorage.getItem('searchTerm');
        if (savedSearchTerm) {
            setSearchTerm(savedSearchTerm);
        }
    }, [])

    const getSongList = useCallback(() => {
        let artistL: string[] = [];

        getRequest('songlist/get', '5100')
            .then(response => response.json())
            .then(data => {
                setSongListData(() => {
                    data.songs = data.songs.map((entry: DBSongListEntry) => {
                        if (!(artistL.includes(entry.artist))) {
                            artistL.push(entry.artist);
                        }
                        return { ...entry, date: formatDate(entry.date), id: parseInt(entry.id) };
                    }); //format date
                    return data.songs;
                });
                setArtistList(artistL);
            });
    }, []);

    useEffect(() => {
        setFilteredSongListData(songListData);
    }, [songListData]);

    function addClick() {
        if (showAddField && newSongData.artist && newSongData.song_name && newSongData.tag) {
            postRequest('songlist/add', '5100', JSON.stringify(newSongData));
            setNewSongData(emptyNewSong);
        } else {

            setShowAddField(prevShowAddField => !prevShowAddField);
        }
    }

    function newSongHandleChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setNewSongData(prevSongData => {
            return {
                ...prevSongData,
                [event.target.name]: event.target.value
            }
        })
    };

    function searchHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
        localStorage.setItem('searchTerm', event.target.value);
    }

    useEffect(() => {
        if (songListData) {
            setFilteredSongListData(() => songListData.filter(elem => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                const lowerArtist = elem.artist.toLowerCase();
                const lowerSong = elem.song_name.toLowerCase();
                return lowerArtist.includes(lowerSearch) || lowerSong.includes(lowerSearch) || `${lowerArtist} ${lowerSong}`.includes(lowerSearch);
            }));
        }
    }, [searchTerm, songListData]);

    function foreignFilter() {
        setPressedButtons(prevPressedButons => { return { ...prevPressedButons, foreign: !prevPressedButons.foreign } });
    }

    function russianFilter() {
        setPressedButtons(prevPressedButons => { return { ...prevPressedButons, russian: !prevPressedButons.russian } });
    }

    function ostFilter() {
        setPressedButtons(prevPressedButons => { return { ...prevPressedButons, ost: !prevPressedButons.ost } });
    }

    function wideRacksFilter() {
        setPressedButtons(prevPressedButons => { return { ...prevPressedButons, wide_racks: !prevPressedButons.wide_racks } });
    }

    function canShow(filter1: boolean, filter2: boolean, filter3: boolean, filter4: boolean, tag: string) {
        return ((filter1 && tag.includes('foreign')) ||
            (filter2 && tag.includes('russian')) ||
            (filter3 && tag.includes('ost')) ||
            (filter4 && tag.includes('wide racks')) ||
            (!filter1 && !filter2 && !filter3 && !filter4));
    };

    useEffect(() => {
        getSongList();
    }, [getSongList]);

    React.useEffect(() => {
        function generateArtistBlocks() {
            let songNumber = 0;
            let artistNumber = 0;
            let blockCount = 0;
            let curBlock: SongListEntry[] = [];
            let prevFirstLetter = artistList[0][0];
            let curBlocks: { key: number, artist: string, songs: SongListEntry[] }[] = [];
            let letterArray: string[] = [];

            setArtistBlocks([]);

            while (artistNumber <= artistList.length) {
                const curArtist = artistList[artistNumber];
                const curSong = filteredSongListData[songNumber];
                const curFirstLetter = curArtist ? curArtist[0] : '';

                if (prevFirstLetter !== curFirstLetter) {
                    if (curBlocks[0]) {
                        const curBlocksCopy = [...curBlocks];
                        const copyPrevFL = prevFirstLetter;
                        setArtistBlocks(prevBlocks => [...prevBlocks,
                        <div className='letter-block' key={copyPrevFL} id={copyPrevFL}>
                            {curBlocksCopy.map(block => <ArtistItem key={block.key} artist={block.artist} songs={block.songs} />)}
                        </div>
                        ]);
                        curBlocks = [];
                        letterArray.push(prevFirstLetter);
                    }
                    prevFirstLetter = curFirstLetter;
                }

                if (curSong && curSong.artist === curArtist && canShow(pressedButtons.foreign, pressedButtons.russian, pressedButtons.ost, pressedButtons.wide_racks, curSong.tag)) {
                    curBlock.push(curSong);
                    songNumber++;
                } else if (curBlock[0]) {
                    const blockCopy = [...curBlock];
                    const countCopy = blockCount;
                    curBlocks.push({ key: countCopy, artist: curArtist, songs: blockCopy });
                    artistNumber++;
                    blockCount++;
                    curBlock = [];
                } else if (curSong) {
                    if (!canShow(pressedButtons.foreign, pressedButtons.russian, pressedButtons.ost, pressedButtons.wide_racks, curSong.tag)) {
                        songNumber++;
                    }
                    if (filteredSongListData[songNumber] && filteredSongListData[songNumber].artist !== artistList[artistNumber]) {
                        artistNumber++;
                    }
                } else {
                    artistNumber++;
                }
            }
            setLetterButtons(letterArray.map(letter => <Link key={letter} smooth={true} offset={-200} to={letter}>{letter}</Link>)) //todo: change offset to different css class on scroll
        }
        if (filteredSongListData && artistList[0]) generateArtistBlocks();
    }, [pressedButtons, filteredSongListData, artistList]);

    return (
        <div className="song-list">
            <div className='background-menu set-sticky'>
                <div className='top-bar'>
                    <Link to='menu' smooth={true}>
                        <button className='top-button'>Up</button>
                    </Link>
                    <input className='search-bar' type='text' placeholder='Search' onChange={searchHandleChange} value={searchTerm} />
                </div>
                <div className='filters'>
                    <button className={pressedButtons.foreign ? 'pressed' : ''} onClick={foreignFilter}>Foreign</button>
                    <button className={pressedButtons.russian ? 'pressed' : ''} onClick={russianFilter}>Russian</button>
                    <button className={pressedButtons.ost ? 'pressed' : ''} onClick={ostFilter}>OST</button>
                    <button className={pressedButtons.wide_racks ? 'pressed' : ''} onClick={wideRacksFilter}>Original</button>
                </div>
                <div className='letter-buttons'>
                    {letterButtons}
                </div>
            </div>
            <div className="add-block">
                {userData.is_admin && <button onClick={addClick}>Add</button>}
                {showAddField &&
                    <div className="list-item">
                        <input type='text' name='artist' onChange={newSongHandleChangeEvent} placeholder='Artist' value={newSongData.artist} />
                        <input type='text' name='song_name' onChange={newSongHandleChangeEvent} placeholder='Song name' value={newSongData.song_name} />
                        <input type='text' name='date' onChange={newSongHandleChangeEvent} placeholder='Date' value={newSongData.date} />
                        <input type='text' name='tag' onChange={newSongHandleChangeEvent} placeholder='Tag' value={newSongData.tag} />
                    </div>}
            </div>
            <div className='song-blocks'>
                {artistBlocks}
            </div>
        </div>
    );
}


export default SongList;