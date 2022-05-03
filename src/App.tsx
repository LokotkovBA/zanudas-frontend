import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu';
import Queue from './pages/Queue';
import SongList from './pages/SongList';
import { getRequest } from './utils/api-requests';
import { UserData } from './utils/interfaces';

export default function App() {
    const [userData, setUserData] = useState<UserData>({ id: 0, display_name: '', profile_image_url: '', is_mod: false, is_admin: false });

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
                    is_admin: data.is_admin
                });
            })
            .catch((err) => { });
    }

    useEffect(() => {
        getUser();
    }, [])

    return (
        <div>
            <Menu userData={userData} />
            <div className="content">
                <Routes>
                    <Route path='/' element={<Navigate to='/queue' />} />
                    <Route path="/queue" element={<Queue userData={userData} />} />
                    <Route path="/songlist" element={<SongList userData={userData} />} />
                </Routes>
            </div>
        </div>
    );
}
