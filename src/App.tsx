import { useState, useEffect, lazy, Suspense } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert } from './components/Alert';
import { LoaderBox } from './components/LoaderBox';
import Menu from './components/Menu';
import { getRequest, postRequest } from './utils/api-requests';
import { UserData } from './utils/interfaces';

const Queue = lazy(() => import('./pages/Queue'));
const SongList = lazy(() => import('./pages/SongList'));
const Users = lazy(() => import('./pages/Users'));
const EditLoading = lazy(() => import('./pages/EditLoading'));

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

    const { data, isSuccess } = useQuery(['user-data'], () => getRequest('auth/success', '5100'), {
        retry: false,
        enabled: localStorage.getItem('login_clicked') === 'yep',
        onError: () => localStorage.setItem('login_clicked', 'nop')
    });

    useEffect(() => {
        if (isSuccess) {
            setUserData({
                id: data.data.id,
                display_name: data.data.display_name,
                profile_image_url: data.data.profile_image_url,
                is_mod: data.data.is_mod,
                is_admin: data.data.is_admin,
                is_cthulhu: data.data.is_cthulhu,
                is_queen: data.data.is_queen,
                is_cookie_alert_shown: data.data.is_cookie_alert_shown
            });
        }
    }, [data, isSuccess]);

    const cookieAccepted = useMutation(() => postRequest('auth/cookiealert', '5100', {}));

    function cookieAlertClick() {
        cookieAccepted.mutate();
    }

    useEffect(() => {
        if (cookieAccepted.isSuccess) {
            setUserData(prevUserData => {
                return { ...prevUserData, is_cookie_alert_shown: true };
            });
        }
    }, [cookieAccepted.isSuccess]);

    return (
        <div>
            <Menu userData={userData} />
            <div className="content">
                <Suspense fallback={<LoaderBox />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/queue" />} />
                        <Route path="/queue" element={<Queue userData={userData} />} />
                        <Route path="/songlist" element={<SongList userData={userData} />} />
                        <Route path="/users" element={<Users userData={userData} />} />
                        <Route path="/loading" element={<EditLoading is_admin={userData.is_admin} />} />
                    </Routes>
                </Suspense>
            </div>
            {!userData.is_cookie_alert_shown &&
                <div className="cookie">
                    <Alert cookieAlertClick={cookieAlertClick} show_button={true} class_name={'alert'} message={`This website uses cookies to keep you logged in!`} />
                </div>
            }
        </div>
    );
}
