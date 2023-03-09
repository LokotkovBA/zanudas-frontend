import React from 'react';

import { NavLink } from 'react-router-dom';

import twitchIconPath from '../icons/twitch.svg';
import { BACKEND_ADDRESS } from '../utils/api-requests';

import daIconPath from '../icons/da.svg';
import { UserData } from '../App';

const loginLink = `https://${BACKEND_ADDRESS}:5100/auth`;
const logoutLink = `https://${BACKEND_ADDRESS}:5100/auth/logout`;
const donateLink = `https://www.donationalerts.com/r/zanuda`;

const Menu: React.FC<{ userData: UserData }> = ({ userData }) => {
    return (
        <nav id="menu" className="main-menu">
            <p className="main-menu__label">&gt;3</p>
            <NavLink className={({ isActive }) => `main-menu__link ${isActive ? 'main-menu__link--active' : ''}`} to="/queue">
                <button type="button">Queue</button>
            </NavLink>
            <NavLink className={({ isActive }) => `main-menu__link ${isActive ? 'main-menu__link--active' : ''}`} to="/songlist">
                <button className="main-menu__button" type="button">Song list</button>
            </NavLink>
            {userData.is_admin &&
                <NavLink className={({ isActive }) => `main-menu__link ${isActive ? 'main-menu__link--active' : ''}`} to="/users">
                    <button className="main-menu__button" type="button">Users</button>
                </NavLink>}
            {userData.is_admin &&
                <NavLink className={({ isActive }) => `main-menu__link ${isActive ? 'main-menu__link--active' : ''}`} to="/loading">
                    <button className="main-menu__button" type="button">Edit Loading Screen</button>
                </NavLink>}
            <a href={donateLink} className="main-menu__link main-menu__link--external main-menu__link--request" target="_blank" rel="noreferrer">
                <button type="button">Request<img src={daIconPath} alt="donation alerts icon" height={20} width={18} /></button>
            </a>
            {userData.display_name &&
                <>
                    <img className="main-menu__picture" width={45} height={45} src={userData.profile_image_url} alt="user avatar" />
                    <p>{userData.display_name}</p>
                    <a className="main-menu__link main-menu__link--external" href={logoutLink} rel="noreferrer">
                        <button type="button" onClick={() => localStorage.setItem('login_clicked', 'nop')}>Log out</button>
                    </a>
                </>}
            {!userData.display_name &&
                <a className="main-menu__link main-menu__link--external" href={loginLink} rel="noreferrer">
                    <button type="button" onClick={() => localStorage.setItem('login_clicked', 'yep')}>Login<img src={twitchIconPath} alt="twitch icon" height={20} width={20} /></button>
                </a>
            }
        </nav>
    );
};

export default Menu;
