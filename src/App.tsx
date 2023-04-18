import { lazy, Suspense, useEffect } from 'react';
import { useMutation } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert } from './components/Alert';
import Menu from './components/Menu';
import { useTypedDispatch, useTypedSelector } from './hooks/redux';
import { useGetUserDataQuery } from './redux/slices/authApiSlice';
import { setCredentials } from './redux/slices/authSlice';
import { patchRequest } from './utils/api-requests';

const Queue = lazy(() => import('./pages/Queue'));
const SongList = lazy(() => import('./pages/SongList'));
const Users = lazy(() => import('./pages/Users'));
const EditLoading = lazy(() => import('./pages/EditLoading'));


export default function App() {
    const { data: userData, isSuccess, refetch } = useGetUserDataQuery(0, { skip: localStorage.getItem('login_clicked') !== 'yep' });
    const { is_cookie_alert_shown } = useTypedSelector(state => state.auth.userData);
    const dispatch = useTypedDispatch();
    useEffect(() => {
        if (isSuccess) {
            dispatch(setCredentials({ userData: userData }));
        }
    }, [dispatch, userData, isSuccess]);

    const { mutate: hideCookie } = useMutation(() => patchRequest('auth', {}), {
        onSuccess: () => {
            refetch();
        }
    });

    return (
        <>
            <Menu />
            <Suspense fallback={<div className="loader" />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/queue" />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/songlist" element={<SongList />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/loading" element={<EditLoading />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
            {!is_cookie_alert_shown &&
                <Alert cookieAlertClick={() => hideCookie()} show_button={true} class_name="alert alert--cookie" message="This website uses cookies to keep you logged in!" />
            }
        </>
    );
}
