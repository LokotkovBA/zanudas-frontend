import { io } from 'socket.io-client';
import { getSocketServerAddress } from './environment';

const SERVER_URL = `https://${getSocketServerAddress()}`;

export const socket = io(SERVER_URL);
