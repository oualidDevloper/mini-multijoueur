import { io } from 'socket.io-client';

// Connect to backend (Use env var in production, localhost in dev)
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const socket = io(URL, {
    autoConnect: true,
    reconnection: true,
});

export default socket;
