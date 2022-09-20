import React, { useEffect, useState } from 'react';

import daIconPath from '../icons/da.svg';
import { getRequest, postRequest } from '../utils/api-requests';

const daLink = "http://localhost:5100/da/auth";
const daSetup = "http://localhost:5100/da/setup";
const daStart = "http://localhost:5100/da/start";
const daStop = "http://localhost:5100/da/stop";

const adminGetTokens = "http://localhost:5100/admin/getToken";
const adminGetMods = "http://localhost:5100/admin/getMods";

interface AdminMenuProps {
    is_admin: boolean;
    max_display: number;
    font_size: string;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ is_admin, max_display, font_size }) => {
    const [newMaxDisplay, setNewMaxDisplay] = useState<number>(max_display);
    const [newFontSize, setNewFontSize] = useState<string>(font_size);

    useEffect(() => {   
        setNewMaxDisplay(max_display);
    },[max_display]);

    useEffect(() => {
        setNewFontSize(font_size);
    },[font_size]);
        
    function onMaxDisplayChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewMaxDisplay(parseInt(event.target.value));
    };
        
    function onFontSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewFontSize(event.target.value);
    };

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
            getRequest('queue/start', '5100');
        };
    };

    function stopQueue() {
        if(is_admin){
            getRequest('queue/stop', '5100');
        };
    };

    function addQueueSong(){
        if(is_admin){
            getRequest('queue/add', '5100');
        };
    };

    return (
        <div className='admin-buttons'>
            {is_admin && <>
                <button onClick={() => window.location.href = daLink}>DA<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>
                <button onClick={() => window.location.href = daSetup}>Setup<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>
                <button onClick={() => window.location.href = daStart}>Start<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>
                <button onClick={() => window.location.href = daStop}>Stop<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>
                <button onClick={() => window.location.href = adminGetTokens}>Get Token</button>
                <button onClick={() => window.location.href = adminGetMods}>Get Mods</button>
                <button onClick={startQueue}>Start queue</button>
                <button onClick={stopQueue}>Stop queue</button>
                <button onClick={addQueueSong}>Add song</button>
                <div>
                    <input type='string' value={newFontSize} onChange={onFontSizeChange} />
                    <button onClick={sendNewFontSize}>Set font size of overlay</button>
                </div>
                <div>
                    <input type='number' value={newMaxDisplay} onChange={onMaxDisplayChange} />
                    <button onClick={sendNewMaxDisplay}>Set max overlay display</button>
                </div>
            </>}
        </div>
    );
}