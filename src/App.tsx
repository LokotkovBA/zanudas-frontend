import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CookieAlert } from './components/CookieAlert';
import Menu from './components/Menu';
import Queue from './pages/Queue';
import SongList from './pages/SongList';
import { Users } from './pages/Users';
import { getRequest } from './utils/api-requests';
import { UserData } from './utils/interfaces';

export default function App() {
    const [userData, setUserData] = useState<UserData>({
        id: 0,
        display_name: ``,
        profile_image_url: ``,
        is_mod: false,
        is_admin: false,
        is_cthulhu: false,
        is_queen: false,
        is_cookie_alert_shown: true
    });

    const getUser = () => {
        getRequest("auth/success", "5100")
            .then((response) => {
                if (response.status === 200) return response.json();
            })
            .then((data) => {
                setUserData({
                    id: parseInt(data.id),
                    display_name: data.display_name,
                    profile_image_url: data.profile_image_url,
                    is_mod: data.is_mod,
                    is_admin: data.is_admin,
                    is_cthulhu: data.is_cthulhu,
                    is_queen: data.is_queen,
                    is_cookie_alert_shown: data.is_cookie_alert_shown
                });
            })
            .catch((err) => { });
    };

    useEffect(() => {
        getUser();
    }, []);

    function cookieAlertClick(){
        getRequest('auth/cookiealert','5100');
        setUserData(prevUserData => {
            return {...prevUserData, is_cookie_alert_shown: true};
        });
    };

    return (
        <div>
            <Menu userData={userData} />
            <div className="content">
                <Routes>
                    <Route path='/' element={<Navigate to='/queue' />} />
                    <Route path="/queue" element={<Queue userData={userData} />} />
                    <Route path="/songlist" element={<SongList userData={userData} />} />
                    <Route path="/users" element={<Users userData={userData} />} />
                </Routes>
            </div>
            {!userData.is_cookie_alert_shown && <CookieAlert cookieAlertClick={cookieAlertClick}/>}
        </div>
    );
}
