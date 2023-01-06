import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { UserData } from '../utils/interfaces';

import twitchIconPath from '../icons/twitch.svg';
import { BACKEND_ADDRESS } from '../utils/api-requests';

import daIconPath from '../icons/da.svg';

const loginLink = `https://${BACKEND_ADDRESS}:5100/auth`;
const logoutLink = `https://${BACKEND_ADDRESS}:5100/auth/logout`;
const donateLink = `https://www.donationalerts.com/r/zanuda`;

const Menu: React.FC<{ userData: UserData }> = ({ userData }) => {

    const url = useLocation();

    function loginClick(){
        localStorage.setItem('login_clicked', 'yep');
        window.location.href = loginLink;
    }

    function logoutClick(){
        localStorage.setItem('login_clicked', 'nop');
        window.location.href = logoutLink;
    }

    return (
        <nav id='menu'>
            <p className="label">&gt;3</p>
            <Link to="/queue" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/queue' && "pressed"}`}>Queue</button>
            </Link>
            <Link to="/songlist" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/songlist' && "pressed"}`}>Song list</button>
            </Link>
            {userData.is_admin && 
            <Link to="/users" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/users' && "pressed"}`}>Users</button>
            </Link>}
            {userData.is_admin && 
            <Link to="/loading" style={{ textDecoration: 'none' }}>
                <button className={`menu ${url.pathname === '/loading' && "pressed"}`}>Edit Loading Screen</button>
            </Link>}
            <a href={donateLink} className='request-link' target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}> 
                <button className='request-button'>Request<img src={daIconPath} alt="donation alerts icon" width={"18em"}/></button>
            </a>
            {userData.display_name && <div className="user-info">
                <img src={userData.profile_image_url} alt='user avatar' />
                <p>{userData.display_name}</p>
                <button className="login-btn" onClick={logoutClick}>Log out</button>
            </div>}
            {!userData.display_name && <button className="login-btn" onClick={loginClick}>Login<img src={twitchIconPath} alt="twitch icon" width="20px" /></button>}
        </nav>
    );
}

export default Menu;