import React from 'react';

import { NavLink } from 'react-router-dom';

import twitchIconPath from '../icons/twitch.svg';
import { BACKEND_ADDRESS } from '../utils/api-requests';

import daIconPath from '../icons/da.svg';
import { UserData } from '../App';

const loginLink = `https://${BACKEND_ADDRESS}:5100/auth`;
const logoutLink = `https://${BACKEND_ADDRESS}:5100/auth/logout`;
const donateLink = `https://www.donationalerts.com/r/zanuda`;

function loginClick() {
    localStorage.setItem('login_clicked', 'yep');
    window.location.href = loginLink;
}

function logoutClick() {
    localStorage.setItem('login_clicked', 'nop');
    window.location.href = logoutLink;
}

const Menu: React.FC<{ userData: UserData }> = ({ userData }) => {
    return (
        <nav id="menu">
            <p className="label">&gt;3</p>
            <NavLink to="/queue" style={{ textDecoration: 'none' }}>
                <button type="button" className={`menu`}>Queue</button>
            </NavLink>
            <NavLink to="/songlist" style={{ textDecoration: 'none' }}>
                <button type="button" className={`menu`}>Song list</button>
            </NavLink>
            {userData.is_admin &&
                <NavLink to="/users" style={{ textDecoration: 'none' }}>
                    <button type="button" className={`menu`}>Users</button>
                </NavLink>}
            {userData.is_admin &&
                <NavLink to="/loading" style={{ textDecoration: 'none' }}>
                    <button type="button" className={`menu}`}>Edit Loading Screen</button>
                </NavLink>}
            <a href={donateLink} className="request-link" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button type="button" className="request-button">Request<img src={daIconPath} alt="donation alerts icon" height={20} width={18} /></button>
            </a>
            {userData.display_name && <div className="user-info">
                <img width={45} height={45} src={userData.profile_image_url} alt="user avatar" />
                <p>{userData.display_name}</p>
                <button type="button" className="login-btn" onClick={logoutClick}>Log out</button>
            </div>}
            {!userData.display_name && <button type="button" className="login-btn" onClick={loginClick}>Login<img src={twitchIconPath} alt="twitch icon" height={20} width={20} /></button>}
        </nav>
    );
};

export default Menu;
