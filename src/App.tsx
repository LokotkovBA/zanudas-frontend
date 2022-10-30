import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert } from './components/Alert';
import Menu from './components/Menu';
import Queue from './pages/Queue';
import SongList from './pages/SongList';
import { Users } from './pages/Users';
import { getRequest, postRequest } from './utils/api-requests';
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

    const {data, isSuccess } = useQuery(['user-data'],() => getRequest('auth/success','5100'),{
        retry: false,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if(isSuccess){
            setUserData({
                id: parseInt(data.data.id),
                display_name: data.data.display_name,
                profile_image_url: data.data.profile_image_url,
                is_mod: data.data.is_mod,
                is_admin: data.data.is_admin,
                is_cthulhu: data.data.is_cthulhu,
                is_queen: data.data.is_queen,
                is_cookie_alert_shown: data.data.is_cookie_alert_shown
            });
        }
    },[data, isSuccess]);

    const cookieAccepted = useMutation(() => postRequest('auth/cookiealert','5100',{ }));

    function cookieAlertClick(){
        cookieAccepted.mutate();
    };

    useEffect(() =>{
        if(cookieAccepted.isSuccess){
            setUserData(prevUserData => {
                return {...prevUserData, is_cookie_alert_shown: true};
            });
        }
    },[cookieAccepted.isSuccess]);

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
            {!userData.is_cookie_alert_shown && 
            <div className='cookie'>
                <Alert cookieAlertClick={cookieAlertClick} show_button={true} class_name={'alert'} message={`This website uses cookies to keep you logged in!`}/>
            </div>
            }
        </div>
    );
}
