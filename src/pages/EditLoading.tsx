import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { z } from 'zod';
import { LoaderBox } from '../components/LoaderBox';
import LoadingMessage from '../components/LoadingMessage';
import { SearchBar } from '../components/SearchBar';
import { getRequest, postRequest } from '../utils/api-requests';

interface EditLoadingProps {
    is_admin: boolean
}

const loadingMessageValidator = z.object({
    id: z.number(),
    message: z.string(),
    triple_end_of: z.string(),
    message_before: z.string().nullable().optional(),
    progress: z.number().nullable().optional(),
});

export type LoadingMessageData = z.infer<typeof loadingMessageValidator>;

async function getMessages() {
    return z.array(loadingMessageValidator).parse((await (await getRequest('loading', 5100)).data));
}

const EditLoading: React.FC<EditLoadingProps> = ({ is_admin }) => {
    const [messagesArray, setMessagesArray] = useState<LoadingMessageData[]>([]);
    const [buttonText, setButtonText] = useState('Add new');

    const [searchTerm, setSearchTerm] = useState<string>(localStorage.getItem('loadingMessagesSearchTerm') ? localStorage.getItem('loadingMessagesSearchTerm')! : '');

    function searchHandleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
        localStorage.setItem('loadingMessagesSearchTerm', event.target.value);
    }

    const { refetch: refetchMessages } = useQuery(['loading-messages'], () => getMessages(), {
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

    function onClickAdd() {
        sendNewMessage.mutate();
    }

    if (!is_admin) {
        return <div></div>;
    }

    if (messagesArray) {
        return <div className="loading-messages">
            <SearchBar searchHandleChange={searchHandleChange} searchTerm={searchTerm} />
            <button type="button" onClick={onClickAdd}>{buttonText}</button>
            {messagesArray.filter(elem => {
                const lowerSearchTerm = searchTerm.toLowerCase();
                return (elem.message.toLowerCase().includes(lowerSearchTerm) || elem.triple_end_of.toLowerCase().includes(lowerSearchTerm) || elem.message_before?.toLowerCase().includes(lowerSearchTerm) || elem.progress?.toString().includes(lowerSearchTerm));
            }).map((message) => {
                return <LoadingMessage key={message.id} message_data={message} refetch_data={refetchMessages} />;
            })}</div>;
    }
    return (<LoaderBox />);
};
export default EditLoading;
