import { Provider } from 'react-redux';
import { store } from './redux/store';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './css/index.scss';
import './css/menu.scss';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
    document.querySelector('#root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </QueryClientProvider>
    </React.StrictMode>
);
