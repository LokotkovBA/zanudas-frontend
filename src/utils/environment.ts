export function getBackendAddress(): string {
    if (process.env.REACT_APP_BACKEND_ADDRESS) {
        return process.env.REACT_APP_BACKEND_ADDRESS;
    }
    return 'localhost:5100';
}

export function getSocketServerAddress(): string {
    if (process.env.REACT_APP_SOCKET_SERVER_ADDRESS) {
        return process.env.REACT_APP_SOCKET_SERVER_ADDRESS;
    }
    return 'localhost:5200';
}
