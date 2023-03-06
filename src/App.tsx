import { useState, useEffect, lazy, Suspense } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import { z } from 'zod';
import { Alert } from './components/Alert';
import { LoaderBox } from './components/LoaderBox';
import Menu from './components/Menu';
import { getRequest, postRequest } from './utils/api-requests';

const Queue = lazy(() => import('./pages/Queue'));
const SongList = lazy(() => import('./pages/SongList'));
const Users = lazy(() => import('./pages/Users'));
const EditLoading = lazy(() => import('./pages/EditLoading'));


const userDataSchema = z.object({
    id: z.number(),
    display_name: z.string(),
    profile_image_url: z.string(),
    is_mod: z.boolean(),
    is_admin: z.boolean(),
    is_cookie_alert_shown: z.boolean(),
    is_cthulhu: z.boolean(),
    is_queen: z.boolean()
});

export type UserData = z.infer<typeof userDataSchema>

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

    useQuery(['user-data'], async () => userDataSchema.parse((await getRequest('auth/success', '5100')).data), {
        retry: false,
        enabled: localStorage.getItem('login_clicked') === 'yep',
        onSuccess: (data) => {
            setUserData(data);
        },
        onError: () => localStorage.setItem('login_clicked', 'nop')
    });

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
                        <Route path="*" element={<Navigate to="/" />} />
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
