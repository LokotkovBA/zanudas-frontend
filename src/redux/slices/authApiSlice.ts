
import apiSlice from '../services/apiSlice';
import { UserData } from './authSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUserData: builder.query<UserData, number>({
            query: () => ({
                url: 'auth/success',
                credentials: 'include'
            })
        }),
    })
});

export const { useGetUserDataQuery } = authApiSlice;
