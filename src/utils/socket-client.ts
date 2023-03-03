import { io } from 'socket.io-client';
import { BACKEND_ADDRESS } from './api-requests';

const SERVER_URL = `https://${BACKEND_ADDRESS}:5200`;

export const socket = io(SERVER_URL);
