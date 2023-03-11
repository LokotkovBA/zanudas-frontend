import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { z } from 'zod';
import { UserData } from '../App';
import { UserListItem } from '../components/UserListItem';
import { getRequest } from '../utils/api-requests';

import '../css/users.scss';
import { Link as ScrollLink } from 'react-scroll';

interface UsersProps {
    userData: UserData
}

const userListSchema = z.object({
    id: z.number(),
    login: z.string(),
    is_mod: z.boolean(),
    is_admin: z.boolean(),
    is_cthulhu: z.boolean(),
    is_queen: z.boolean(),
    is_cookie_alert_shown: z.boolean(),
});

export type UserEntry = z.infer<typeof userListSchema>;

function filterUserList(data: UserEntry[], searchTerm: string, onlyModsToggle: boolean, is_admin: boolean) {
    return data.filter(entry => (!onlyModsToggle || (onlyModsToggle && (entry.is_admin || entry.is_mod))) && entry.login.includes(searchTerm))
        .map((entry) => <UserListItem key={entry.id} userEntry={entry} is_admin={is_admin} />);
}

const Users: React.FC<UsersProps> = ({ userData }) => {
    const [userList, setUserList] = useState<JSX.Element[]>();

    const [searchTerm, setSearchTerm] = useState<string>(localStorage.getItem('usersSearchTerm') ? localStorage.getItem('usersSearchTerm')! : '');

    const [onlyModsState, setOnlyModsState] = useState<{ toggle: boolean, text: 'Only mods' | 'All users' }>({ toggle: false, text: 'Only mods' });

    const { data, isLoading } = useQuery(['users-data'], async () => z.array(userListSchema).parse((await getRequest('admin/users', '5100')).data), {
        onSuccess: (data) => {
            setUserList(filterUserList(data, searchTerm, onlyModsState.toggle, userData.is_admin));
        }
    });

    function searchHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
        localStorage.setItem('usersSearchTerm', event.target.value);
        if (data) {
            setUserList(filterUserList(data, event.target.value, onlyModsState.toggle, userData.is_admin));
        }
    }

    function toggleOnlyMods() {
        setOnlyModsState((prevState) => {
            return {
                toggle: !prevState.toggle,
                text: prevState.toggle ? 'Only mods' : 'All users'
            };
        });
        if (data) {
            setUserList(filterUserList(data, searchTerm, !onlyModsState.toggle, userData.is_admin));
        }
    }

    if (isLoading) {
        return (
            <div className="loader">
                <div className="loader__circle" />
            </div>);
    }

    return (
        <>
            {userData.is_admin &&
                <div className="page-nav">
                    <input className="search" type="text" placeholder="Search" onChange={searchHandleChange} value={searchTerm} />
                    <button className="button" type="button" onClick={toggleOnlyMods}>{onlyModsState.text}</button>
                </div>}
            <ul className="user-list">
                {userList}
            </ul>
            <ScrollLink className={`up-button`} to="menu" smooth={true}>
                <button type="button" className="button up-button__button">Up</button>
            </ScrollLink>
        </>
    );
};

export default Users;
