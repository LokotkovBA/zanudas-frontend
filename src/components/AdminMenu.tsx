import React from 'react';

import daIconPath from '../icons/da.svg';
import { getRequest } from '../utils/api-requests';

const daLink = "http://localhost:5300/da/auth";
const daSetup = "http://localhost:5300/da/setup";
const daStart = "http://localhost:5300/da/start";
const daStop = "http://localhost:5300/da/stop";

const adminGetTokens = "http://localhost:5100/admin/getToken";
const adminGetMods = "http://localhost:5100/admin/getMods";

interface AdminMenuProps {
    is_admin: boolean;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ is_admin }) => {

    function startQueue() {
        getRequest('queue/start', '5100')
    };

    function stopQueue() {
        getRequest('queue/stop', '5100')
    };

    return (
        <div className='admin-buttons'>
            {is_admin && <button onClick={() => window.location.href = daLink}>DA<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {is_admin && <button onClick={() => window.location.href = daSetup}>Setup<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {is_admin && <button onClick={() => window.location.href = daStart}>Start<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {is_admin && <button onClick={() => window.location.href = daStop}>Stop<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {is_admin && <button onClick={() => window.location.href = adminGetTokens}>Get Token</button>}
            {is_admin && <button onClick={() => window.location.href = adminGetMods}>Get Mods</button>}
            {is_admin && <button onClick={startQueue}>Start queue</button>}
            {is_admin && <button onClick={stopQueue}>Stop queue</button>}
        </div>
    );
}