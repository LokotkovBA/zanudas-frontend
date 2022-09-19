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
    min_donate: number;
    max_display: number;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ is_admin, min_donate, max_display }) => {
    // const [newMinDonate, setNewMinDonate] = useState<number>(min_donate);
    const [newMaxDisplay, setNewMaxDisplay] = useState<number>(max_display);

    // useEffect(() => {   
    //     setNewMinDonate(min_donate);
    // },[min_donate]);

    useEffect(() => {   
        setNewMaxDisplay(max_display);
    },[max_display]);

    // function onMinAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    //     setNewMinDonate(parseInt(event.target.value));
    // };

    function onMaxDisplayChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewMaxDisplay(parseInt(event.target.value));
    };

    // function sendNewAmount(){
    //     postRequest('da/setMinDonate', 5100, JSON.stringify({ new_min_donate: newMinDonate}));
    // };

    function sendNewMaxDisplay(){
        postRequest('da/setMaxDisplay', 5100, JSON.stringify({ new_max_display: newMaxDisplay}));
    }

    function startQueue() {
        getRequest('queue/start', '5100');
    };

    function stopQueue() {
        getRequest('queue/stop', '5100');
    };

    function addQueueSong(){
        getRequest('queue/add', '5100');
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
                {/* <div>
                    <input type='number' value={newMinDonate} onChange={onMinAmountChange} />
                    <button onClick={sendNewAmount}>Set Min Amount</button>
                </div> */}
                <div>
                    <input type='number' value={newMaxDisplay} onChange={onMaxDisplayChange} />
                    <button onClick={sendNewMaxDisplay}>Set max overlay display</button>
                </div>
            </>}
        </div>
    );
}