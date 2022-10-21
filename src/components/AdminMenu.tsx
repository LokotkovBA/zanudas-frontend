import React, { useEffect, useState } from 'react';

import daIconPath from '../icons/da.svg';
import { BACKEND_ADDRESS, postRequest } from '../utils/api-requests';


const daLink = `https://${BACKEND_ADDRESS}:5100/da/auth`;

const adminGetTokens = `https://${BACKEND_ADDRESS}:5100/admin/getToken`;

interface AdminMenuProps {
    is_admin: boolean;
    max_display: number;
    font_size: string;
    is_live: boolean;
    info_text: string;
    show_info: boolean;
    is_setup_da: boolean;
    is_listening_da: boolean;
    hid_token_buttons: boolean;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ is_admin, max_display, font_size, is_live, info_text, show_info, is_setup_da, is_listening_da, hid_token_buttons }) => {
    const [newMaxDisplay, setNewMaxDisplay] = useState<number>(max_display);
    const [newFontSize, setNewFontSize] = useState<string>(font_size);
    const [infoText, setInfoText] = useState<string>(info_text);
    const [showInfo, setShowInfo] = useState<boolean>(show_info);

    useEffect(() => {   
        setNewMaxDisplay(max_display);
    },[max_display]);

    useEffect(() => {
        setNewFontSize(font_size);
    },[font_size]);

    useEffect(() => {
        setInfoText(info_text);
    },[info_text]);

    useEffect(() => {
        setShowInfo(show_info);
    },[show_info]);
        
    function onMaxDisplayChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewMaxDisplay(parseInt(event.target.value));
    };
        
    function onFontSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewFontSize(event.target.value);
    };

    function onTextInfoAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>){
        setInfoText(event.target.value);
    };

    function onShowInfoChange(event: React.ChangeEvent<HTMLInputElement>){
        if(is_admin){
            postRequest('admin/hideInfoText', '5100', JSON.stringify({show_info: event.target.checked}));
        }
        setShowInfo(event.target.checked);
    }

    function setupDA(){
        if(is_admin){
            postRequest('da/setup', '5100', '{}');
        };
    }

    function startDA(){
        if(is_admin){
            postRequest('da/start', '5100', '{}');
        };
    };

    function stopDA(){
        if(is_admin){
            postRequest('da/stop', '5100', '{}');
        };
    };

    function getTwitchMods(){
        if(is_admin){
            postRequest('admin/getTwitchMods', '5100', '{}');
        };
    }

    function sendNewMaxDisplay(){
        if(is_admin){
            postRequest('da/setMaxDisplay', 5100, JSON.stringify({ new_max_display: newMaxDisplay}));
        };
    };

    function sendNewFontSize(){
        if(is_admin){
            postRequest('admin/changeFontSize', 5100, JSON.stringify({ fontSize: newFontSize}));
        };
    };

    function startQueue() {
        if(is_admin){
            postRequest('queue/start', '5100', '{}');
        };
    };

    function stopQueue() {
        if(is_admin){
            postRequest('queue/stop', '5100', '{}');
        };
    };

    function addQueueSong(){
        if(is_admin){
            postRequest('queue/add', '5100', '{}');
        };
    };

    function changeInfo(){
        if(is_admin){
            postRequest('admin/changeInfoText','5100', JSON.stringify({ infoText: infoText }))
        }
    };

    function changeTokenButtonsVisibility(){
        if(is_admin){
            postRequest('admin/changeTokenButtonsVisibility','5100', JSON.stringify({ hid_token_buttons: !hid_token_buttons }))
        }
    };

    return (
        <div className='admin-buttons'>
            {is_admin && <>
                <button className={hid_token_buttons ? '' : 'pressed'} onClick={changeTokenButtonsVisibility}>{hid_token_buttons ? 'Show' : 'Hide'}</button>
                {!hid_token_buttons && <button onClick={() => window.location.href = daLink}>DA<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
                {!is_setup_da && <button onClick={setupDA}>Setup<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
                {is_setup_da && (is_listening_da ? 
                    <button className='pressed' onClick={stopDA}>Stop<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>
                    : 
                    <button onClick={startDA}>Start<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>)
                }
                {!hid_token_buttons && <button onClick={() => window.location.href = adminGetTokens}>Twitch Token</button>}
                <button onClick={getTwitchMods}>Twitch Mods</button>
                {!is_live && <button onClick={startQueue}>Start queue</button>}
                {is_live && <button className='pressed' onClick={stopQueue}>Stop queue</button>}
                <button onClick={addQueueSong}>Add song</button>
                <div>
                    <input type='string' value={newFontSize} onChange={onFontSizeChange} />
                    <button onClick={sendNewFontSize}>Set font size of overlay</button>
                </div>
                <div>
                    <input type='number' value={newMaxDisplay} onChange={onMaxDisplayChange} />
                    <button onClick={sendNewMaxDisplay}>Set max overlay display</button>
                </div>
                <div className='edit-info'>
                    <textarea name='text-info' className='text-info' onChange={onTextInfoAreaChange} value={infoText} />
                    <div className='edit-checkbox'>
                        <input type='checkbox' className='show-info' name='show-info' checked={showInfo} onChange={onShowInfoChange} />
                        <label htmlFor='show-info'>show info</label>
                    </div>
                    <button onClick={changeInfo}>Change info</button>
                </div>
            </>}
        </div>
    );
}