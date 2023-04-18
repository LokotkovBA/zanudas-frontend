import React from 'react';

import { NavLink } from 'react-router-dom';

import twitchIconPath from '../icons/twitch.svg';
import { BACKEND_ADDRESS } from '../utils/api-requests';

import daIconPath from '../icons/da.svg';
import { useTypedSelector } from '../hooks/redux';

const loginLink = `https://${BACKEND_ADDRESS}/auth`;
const logoutLink = `https://${BACKEND_ADDRESS}/auth/logout`;
const donateLink = `https://www.donationalerts.com/r/zanuda`;

const Menu: React.FC = () => {
    const is_admin = useTypedSelector(state => state.auth.userData.is_admin);
    const profile_image_url = useTypedSelector(state => state.auth.userData.profile_image_url);
    const display_name = useTypedSelector(state => state.auth.userData.display_name);

    return (
        <nav id="menu" className="main-menu">
            <p className="main-menu__label">&gt;3</p>
            <NavLink className={({ isActive }) => `main-menu__link button main-menu__button${isActive ? ' main-menu__link--active' : ''}`} to="/queue">
                Queue
            </NavLink>
            <NavLink className={({ isActive }) => `main-menu__link button main-menu__button${isActive ? ' main-menu__link--active' : ''}`} to="/songlist">
                Song list
            </NavLink>
            {is_admin &&
                <NavLink className={({ isActive }) => `main-menu__link button main-menu__button${isActive ? ' main-menu__link--active' : ''}`} to="/users">
                    Users
                </NavLink>}
            {is_admin &&
                <NavLink className={({ isActive }) => `main-menu__link button main-menu__button${isActive ? ' main-menu__link--active' : ''}`} to="/loading">
                    Edit Loading Screen
                </NavLink>}
            <a href={donateLink} className="main-menu__link main-menu__link--external main-menu__link--request button" target="_blank" rel="noreferrer">
                Request<img src={daIconPath} alt="donation alerts icon" height={20} width={18} />
            </a>
            {display_name &&
                <>
                    <img className="main-menu__picture" width={45} height={45} src={profile_image_url} alt="user avatar" />
                    <p>{display_name}</p>
                    <a onClick={() => localStorage.setItem('login_clicked', 'nop')} className="main-menu__link main-menu__link--external button" href={logoutLink} rel="noreferrer">
                        Log out
                    </a>
                </>}
            {!display_name &&
                <a onClick={() => localStorage.setItem('login_clicked', 'yep')} className="main-menu__link main-menu__link--external button" href={loginLink} rel="noreferrer">
                    Login<img src={twitchIconPath} alt="twitch icon" height={20} width={20} />
                </a>
            }
        </nav>
    );
};

export default Menu;
