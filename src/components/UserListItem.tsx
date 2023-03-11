import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useTypedSelector } from '../hooks/redux';
import { UserEntry } from '../pages/Users';
import { deleteRequest, patchRequest } from '../utils/api-requests';

interface UserListItemProps {
    userEntry: UserEntry;
}

export const UserListItem: React.FC<UserListItemProps> = ({ userEntry }) => {
    const is_admin = useTypedSelector(state => state.auth.userData.is_admin);
    const [userEntryData, setUserEntryData] = useState<UserEntry>(userEntry);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>('Delete');
    useEffect(() => {
        setUserEntryData(userEntry);
    }, [userEntry]);

    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setUserEntryData(prevUserData => {
            const { name, checked } = event.target;
            const newUserData = { ...prevUserData, [name]: checked };
            return newUserData;
        });
    }

    const changeUserRequest = useMutation((newUserData: UserEntry) => patchRequest('admin/user', newUserData));
    const deleteUserRequest = useMutation((userId: number) => deleteRequest('admin/user', { id: userId }), {
        onSuccess: () => {
            setDeleteButtonText('Deleted');
            setDeleteIntention(false);
        },
        onError: () => setDeleteButtonText('Error!')
    });

    function changeUser() {
        if (is_admin) {
            changeUserRequest.mutate(userEntryData);
        }
    }

    function deleteUser() {
        if (is_admin) {
            if (deleteIntention) {
                deleteUserRequest.mutate(userEntryData.id);
            } else {
                setDeleteButtonText('Sure?');
                setDeleteIntention(true);
            }
        }
    }


    return (
        <li className="entry user-list__entry">
            <b>{userEntryData.login}</b>
            <div className="checkboxes">
                <input type="checkbox" name="is_mod" checked={userEntryData.is_mod} onChange={queueEntryChangeEvent} />
                <label htmlFor="is_mod">is_mod</label>
                <input type="checkbox" name="is_admin" checked={userEntryData.is_admin} onChange={queueEntryChangeEvent} />
                <label htmlFor="is_admin">is_admin</label>
                <input type="checkbox" name="is_cthulhu" checked={userEntryData.is_cthulhu} onChange={queueEntryChangeEvent} />
                <label htmlFor="is_cthulhu">is_cthulhu</label>
                <input type="checkbox" name="is_queen" checked={userEntryData.is_queen} onChange={queueEntryChangeEvent} />
                <label htmlFor="is_queen">is_queen</label>
            </div>
            <div className="side-buttons">
                <button type="button" className="button" onClick={changeUser}>Change</button>
                <button type="button" className="button" onClick={deleteUser}>{deleteButtonText}</button>
            </div>
        </li>
    );
};
