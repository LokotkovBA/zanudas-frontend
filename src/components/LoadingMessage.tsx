import { useState } from 'react'
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from 'react-query';
import { LoadingMessageData } from '../pages/EditLoading';
import { deleteRequest, patchRequest } from '../utils/api-requests';

interface LoadingMessageProps {
    message_data: LoadingMessageData;
    refetch_data: <TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) =>  Promise<QueryObserverResult<{
        message_before?: string | null | undefined;
        progress?: number | null | undefined;
        id: number;
        message: string;
        triple_end_of: string;
    }[], unknown>>;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({message_data, refetch_data}) => {

    const [messageData, setMessageData] = useState(message_data);
    const [buttonText, setButtonText] = useState('Change');
    const [deleteButtonText, setDeleteButtonText] = useState('Delete');
    const [deleteIntention, setDeleteIntention] = useState(false);

    function inputChangeHandler(event:  React.ChangeEvent<HTMLInputElement>){
        setMessageData(prevMessageData => {
            const {name, value} = event.target;
            let outp: string|number = (name === 'progress') ? parseInt(value) : value;
            return {
                ...prevMessageData,
                [name]: outp
            }
        })
    }

    function submit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        sendMessageData.mutate(messageData)
    }

    const sendMessageData = useMutation((newMessageData: LoadingMessageData) => patchRequest('loading', 5100, newMessageData), {
        onSuccess: () => setButtonText('Success!'),
        onError: () => setButtonText('Error!')
    });

    const deleteLoadingMessage = useMutation((id: number) => deleteRequest('loading', 5100, {id: id}), {
        onSuccess: () => {
            setDeleteButtonText('Success!');
            refetch_data();
        },
        onError: () => setDeleteButtonText('Error!')
    });

    function clickDelete(){
        if(deleteIntention){
            deleteLoadingMessage.mutate(messageData.id);
            setDeleteIntention(false);
        }else{
            setDeleteButtonText('Sure?');
            setDeleteIntention(true); 
        }  
    };

    return (
    <form className='loading-message' onSubmit={submit}>
        <div className='loading-message-message'>
            <label htmlFor='message'>Message</label>
            <input name='message' type='string' value={messageData.message} onChange={inputChangeHandler} />
        </div>
        <div className='loading-message-triple_end_of'>
            <label htmlFor='triple_end_of'>Tripple end of</label>
            <input name='triple_end_of' type='string' value={messageData.triple_end_of} onChange={inputChangeHandler} />
        </div>
        <div className='loading-message-message_before'>
            <label htmlFor='message_before'>Message before</label>
            <input name='message_before' type='string' value={messageData.message_before ? messageData.message_before : ''} onChange={inputChangeHandler} />
        </div>
        <div className='loading-message-progress'>
            <label htmlFor='progress'>Progress</label>
            <input name='progress' type='string' value={messageData.progress ? messageData.progress : ''} onChange={inputChangeHandler} />
        </div>
        <button>{buttonText}</button>
        <button onClick={clickDelete} className='loading-message-delete-button'>{deleteButtonText}</button>
    </form>);
}

export default LoadingMessage;