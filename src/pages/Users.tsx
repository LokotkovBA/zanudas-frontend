import { useEffect, useState } from 'react'
import { SearchBar } from '../components/SearchBar';

import { UserListItem } from '../components/UserListItem';
import { getRequest } from '../utils/api-requests';
import { UserData, UserEntry } from '../utils/interfaces';

interface UsersProps {
    userData: UserData
}

export const Users: React.FC<UsersProps> = ({userData}) => {
    const [userListData, setUserListData] = useState<UserEntry[]>();
    const [userList, setUserList] = useState<JSX.Element[]>();

    const [searchTerm, setSearchTerm] = useState<string>('');

    const [onlyModsToggle, setOnlyModsToggle] = useState<boolean>(false);
    const [onlyModsButtonText, setOnlyModsButtonText] = useState<string>('Only mods');

    useEffect(() => {
        const controller = new AbortController();
        if(userData.is_admin){
            getRequest('admin/getUsers', '5100', controller.signal)
            .then(response => response.json())
            .then(data => {
                setUserListData(data);
            })
            .catch(error =>{
                if(error.name !== 'AbortError'){
                    console.error(error);
                }
            });
        }
        return () => {
            controller.abort();
        }
    },[userData.is_admin]);

    useEffect(() =>{
        if(userListData){
            setUserList(userListData.filter(entry => (!onlyModsToggle || (onlyModsToggle && (entry.is_admin || entry.is_mod))) && entry.login.includes(searchTerm)).map((entry, index) => {
                return <UserListItem key={index} userEntry={entry} is_admin={userData.is_admin}/>
            }))
        }
    },[userListData, userData.is_admin, searchTerm, onlyModsToggle]);

    function searchHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
        localStorage.setItem('searchTerm', event.target.value);
    };

    function toggleOnlyMods(){
        let prevOnlyMods = !onlyModsToggle;
        setOnlyModsToggle(prevOnlyMods);
        setOnlyModsButtonText(prevOnlyMods ? 'All users' : 'Only mods')
    }

    return (
        <div className='user-list'>
            {userData.is_admin &&
            <div className='background-menu set-sticky'>
                <SearchBar searchHandleChange={searchHandleChange} searchTerm={searchTerm}/>
                <button onClick={toggleOnlyMods}>{onlyModsButtonText}</button>
            </div>}
            {userList}
        </div>
    );
}