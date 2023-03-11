
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import apiSlice from './services/apiSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({ auth: authReducer });

export const setupStore = () => {
    return configureStore({
        reducer: {
            [apiSlice.reducerPath]: apiSlice.reducer,
            auth: authReducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
    });
};

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type DispatchType = ReturnType<typeof setupStore>['dispatch'];
