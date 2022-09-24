import React, { useCallback, useEffect, useState } from "react";
import { getRequest, postRequest } from "../utils/api-requests";
import { formatDate, getFormatDate } from "../utils/date";
import { DBSongListEntry, Filters, SongListEntry, UserData } from "../utils/interfaces";

import ArtistItem from "../components/ArtistItem";
import { Link } from "react-scroll";
import { SearchBar } from "../components/SearchBar";
import useWindowDimensions from "../utils/useWindowDimensions";

import pathToArrowUp from "../icons/arrow-up.svg";
import pathToArrowDown from "../icons/arrow-down.svg";

const SongList: React.FC<{ userData: UserData }> = ({ userData }) => {
    const { width } = useWindowDimensions();
    const [showLetterButtons, setShowLetterButtons] = useState<boolean>(false);
    const [arrowState, setArrowState] = useState(pathToArrowDown);

    const [pressedButtons, setPressedButtons] = useState<Filters>({
        foreign: false,
        russian: false,
        ost: false,
        wide_racks: false
    });

    const [artistBlocks, setArtistBlocks] = useState<JSX.Element[]>([]);
    const [letterButtons, setLetterButtons] = useState<JSX.Element[]>([]);

    const [songListData, setSongListData] = useState<SongListEntry[]>([]);
    const [importedSongListData, setImportedSongListData] = useState<SongListEntry[]>([]);
    const [filteredSongListData, setFilteredSongListData] = useState<SongListEntry[]>([]);
    const [showAddField, setShowAddField] = useState<boolean>(false);
    const [artistList, setArtistList] = useState<string[]>([]);

    const emptyNewSong: SongListEntry = {
        artist: '',
        song_name: '',
        date: getFormatDate(),
        tag: '',
        likes: 0,
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
                        return { ...entry, date: formatDate(entry.date), id: parseInt(entry.id), likes: parseInt(entry.likes) };
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
    };

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

    function exportAll(){
        const jsonStringData = `data:text/json;chatset=utf8,${encodeURIComponent(JSON.stringify(songListData))}`;
        const link = document.createElement("a");
        link.href = jsonStringData;
        link.download = "data.json";

        link.click();
    };

    function importSongList(e: React.ChangeEvent<HTMLInputElement>){
        const filereader = new FileReader();
        if(e.target.files){
            filereader.readAsText(e.target.files[0], "UTF-8");
            filereader.onload = (event) =>{
                if(event.target && event.target.result){
                    setImportedSongListData(JSON.parse(event.target.result as string));
                }
            }
        };
    };

    function sendFile(){
        if(userData.is_admin && importedSongListData[0]){
            postRequest('songlist/addMultiple', 5100, JSON.stringify({songs: importedSongListData}));
        }
    };

    function changeShowLetterButtons(){
        if(showLetterButtons){
            setArrowState(pathToArrowDown);
        }else{
            setArrowState(pathToArrowUp);
        }
        setShowLetterButtons(prevState => !prevState);
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
                            {curBlocksCopy.map(block => <ArtistItem key={block.key} artist={block.artist} songs={block.songs}  userData={userData}/>)}
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
    }, [pressedButtons, filteredSongListData, artistList, userData]);

    return (
        <div className="song-list">
            <div className='background-menu set-sticky'>
                <SearchBar searchHandleChange={searchHandleChange} searchTerm={searchTerm}/>
                <div className='filters'>
                    <button className={pressedButtons.foreign ? 'pressed' : ''} onClick={foreignFilter}>Foreign</button>
                    <button className={pressedButtons.russian ? 'pressed' : ''} onClick={russianFilter}>Russian</button>
                    <button className={pressedButtons.ost ? 'pressed' : ''} onClick={ostFilter}>OST</button>
                    <button className={pressedButtons.wide_racks ? 'pressed' : ''} onClick={wideRacksFilter}>Original</button>
                    { (width <= 728) && <span className="show-more-icon" onClick={changeShowLetterButtons}><img src={arrowState} alt="show more icon"/></span>}
                </div>
                { (width > 728 || showLetterButtons) && <div className='letter-buttons'>
                    { letterButtons}
                </div> }
            </div>
            <div className="add-block">
                {userData.is_admin && 
                <div className="songlist-edits">
                    <button onClick={addClick}>Add</button>
                    <button onClick={exportAll}>Export all</button>
                    <input type='file' onChange={(event) => importSongList(event)}/>
                    <button onClick={sendFile}>Send file</button>
                </div>}
                {showAddField &&
                    <div className="list-item">
                        <input type='text' name='artist' onChange={newSongHandleChangeEvent} placeholder='Artist' value={newSongData.artist} />
                        <input type='text' name='song_name' onChange={newSongHandleChangeEvent} placeholder='Song name' value={newSongData.song_name} />
                        <input type='text' name='date' onChange={newSongHandleChangeEvent} placeholder='Date' value={newSongData.date as string} />
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