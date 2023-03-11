import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userData: {
        id: 0,
        display_name: '',
        profile_image_url: '',
        is_mod: false,
        is_admin: false,
        is_cookie_alert_shown: true,
        is_cthulhu: false,
        is_queen: false,
    }
};

export type UserData = typeof initialState.userData;

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, { payload }) => {
            state.userData = payload.userData;
        },
        logOut: (state) => {
            state.userData = initialState.userData;
        }
    }
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;
