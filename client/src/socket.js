import { io } from 'socket.io-client';

// Connect to backend (URL hardcoded for now, ideal to use env var)
const URL = 'http://localhost:3000';

const socket = io(URL, {
    autoConnect: true,
    reconnection: true,
});

export default socket;
