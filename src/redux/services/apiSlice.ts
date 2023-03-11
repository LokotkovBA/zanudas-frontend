import { BaseQueryApi, createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getBackendAddress } from '../../utils/environment';

const baseQuery = fetchBaseQuery({ baseUrl: `https://${getBackendAddress()}` });

const baseQueryWitchAuthCheck = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    const response = await baseQuery(args, api, extraOptions);
    if (response.error?.status === 401) {
        localStorage.setItem('login_clicked', 'nop');
    }
    return response;
};

const apiSlice = createApi({
    reducerPath: 'zanudasAPI',
    baseQuery: baseQueryWitchAuthCheck,
    endpoints: () => ({})
});


export default apiSlice;
