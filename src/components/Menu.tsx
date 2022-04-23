import React from 'react';

import {Link, useLocation} from 'react-router-dom';
import { UserData } from '../utils/interfaces';

import twitchIconPath from '../icons/twitch.svg';
import daIconPath from '../icons/da.svg';

const loginLink = "http://localhost:5100/auth";
const logoutLink = "http://localhost:5100/auth/logout";
const daLink = "http://localhost:5300/da/auth";
const daStart = "http://localhost:5300/da/start";
const daStop = "http://localhost:5300/da/stop";




const Menu: React.FC<{userData: UserData}> = ({userData}) =>{

    const url = useLocation();
    
    return (
        <nav id='menu'>
            <p className="label">&gt;3</p>
            <Link to="/queue" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/queue' && "pressed"}`}>Queue</button>
            </Link>
            <Link to="/songlist" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/songlist' && "pressed"}`}>Song list</button>
            </Link>
            {userData.is_admin &&<button  onClick={() => window.location.href = daLink}>DA<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {userData.is_admin &&<button  onClick={() => window.location.href = daStart}>Start<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {userData.is_admin && <button  onClick={() => window.location.href = daStop}>Stop<img src={daIconPath} alt="donation alerts icon" width="18em"></img></button>}
            {userData.display_name &&<div className="user-info">
                <img src={userData.profile_image_url} alt='user avatar'/>
                <p>{userData.display_name}</p>
                <button className="login-btn" onClick={() => window.location.href = logoutLink}>Log out</button>
            </div>}
            {!userData.display_name && <button className="login-btn" onClick={() => window.location.href = loginLink}>Login<img src={twitchIconPath} alt="twitch icon" width="20px"/></button>}
        </nav>
    );
}

export default Menu;