import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { z } from 'zod';
import { getRequest, postRequest } from '../utils/api-requests';
import LoadingMessage from '../components/LoadingMessage';

import '../css/editloading.scss';
import { Link as ScrollLink } from 'react-scroll';

interface EditLoadingProps {
    is_admin: boolean
}

export const loadingMessageSchema = z.object({
    id: z.number(),
    message: z.string(),
    triple_end_of: z.string(),
    message_before: z.string().nullable().optional(),
    progress: z.number().nullable().optional(),
});

export type LoadingMessageData = z.infer<typeof loadingMessageSchema>;

const EditLoading: React.FC<EditLoadingProps> = ({ is_admin }) => {
    const [messagesArray, setMessagesArray] = useState<LoadingMessageData[]>([]);
    const [buttonText, setButtonText] = useState('Add new');

    const [searchTerm, setSearchTerm] = useState<string>(localStorage.getItem('loadingMessagesSearchTerm') ? localStorage.getItem('loadingMessagesSearchTerm')! : '');

    const { refetch: refetchMessages } = useQuery(['loading-messages'], async () => z.array(loadingMessageSchema).parse((await getRequest('loading', 5100)).data), {
        onSuccess: (data) => {
            setMessagesArray(data);
        }
    });

    const sendNewMessage = useMutation(() => postRequest('loading', 5100, {}), {
        onSuccess: () => {
            refetchMessages();
            setButtonText('Success!');
        },
        onError: () => setButtonText('Error!')
    });
    if (!is_admin) {
        return <div></div>;
    }

    if (messagesArray) {
        return (
            <>
                <div className="page-nav loading__page-nav">
                    <input className="search" type="text" placeholder="Search" onChange={(event) => {
                        setSearchTerm(event.target.value);
                        localStorage.setItem('loadingMessagesSearchTerm', event.target.value);
                    }} value={searchTerm} />
                    <button className="button" type="button" onClick={() => sendNewMessage.mutate()}>{buttonText}</button>
                </div>
                <div className="loading-list">
                    {messagesArray.filter(elem => {
                        const lowerSearchTerm = searchTerm.toLowerCase();
                        return (elem.message.toLowerCase().includes(lowerSearchTerm) || elem.triple_end_of.toLowerCase().includes(lowerSearchTerm) || elem.message_before?.toLowerCase().includes(lowerSearchTerm) || elem.progress?.toString().includes(lowerSearchTerm));
                    }).map((message) => {
                        return <LoadingMessage key={message.id} message_data={message} refetch_data={refetchMessages} />;
                    })}
                </div>
                <ScrollLink className={`up-button`} to="menu" smooth={true}>
                    <button type="button" className="button up-button__button">Up</button>
                </ScrollLink>
            </>);
    }
    return (
        <div className="loader">
            <div className="loader__circle" />
        </div>);
};
export default EditLoading;
