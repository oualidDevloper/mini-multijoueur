const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { createSession, joinSession, getSession, removePlayer, cleanupSessions } = require('./sessionManager');
const tictactoe = require('./games/tictactoe');
const rps = require('./games/rps');
const memory = require('./games/memory');
const connect4 = require('./games/connect4');
const reflex = require('./games/reflex');
const hangman = require('./games/hangman');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for now, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Cleanup inactive sessions every minute
setInterval(cleanupSessions, 60 * 1000);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create Session
    socket.on('create_session', ({ gameType, playerName }) => {
        if (!['tictactoe', 'rps', 'memory', 'connect4', 'reflex', 'hangman'].includes(gameType)) {
            return socket.emit('error', 'Type de jeu invalide');
        }

        const session = createSession(gameType);

        // Initialize specific game state
        if (gameType === 'tictactoe') session.gameState = tictactoe.initGame();
        if (gameType === 'rps') session.gameState = rps.initGame();
        if (gameType === 'memory') session.gameState = memory.initGame();
        if (gameType === 'connect4') session.gameState = connect4.initGame();
        if (gameType === 'reflex') session.gameState = reflex.initGame();
        if (gameType === 'hangman') session.gameState = hangman.initGame();

        const player = {
            id: socket.id, // simple player ID
            name: playerName || `Joueur ${session.players.length + 1}`,
            socketId: socket.id,
            symbol: gameType === 'tictactoe' || gameType === 'connect4' ? (session.players.length === 0 ? 'X' : 'O') : null
        };

        session.players.push(player); // Creator joins automatically
        socket.join(session.code);

        socket.emit('session_created', {
            code: session.code,
            playerId: player.id,
            session
        });
    });

    // Join Session
    socket.on('join_session', ({ code, playerName }) => {
        const result = joinSession(code, {
            id: socket.id,
            name: playerName,
            socketId: socket.id
        });

        if (result.error) {
            return socket.emit('error', result.error);
        }

        const { session } = result;
        const player = session.players.find(p => p.socketId === socket.id);

        // Assign symbol if TicTacToe or Connect4
        if ((session.gameType === 'tictactoe' || session.gameType === 'connect4') && !player.symbol) {
            const p1 = session.players[0];
            player.symbol = p1.symbol === 'X' ? 'O' : 'X';
        }

        socket.join(session.code);

        // Notify player they joined
        socket.emit('session_joined', {
            code: session.code,
            playerId: player.id,
            session
        });

        // Notify room
        io.to(session.code).emit('session_update', session);

        // Auto-start for TicTacToe & Connect4 & Memory (2 players)
        if (['tictactoe', 'connect4', 'memory'].includes(session.gameType) && session.players.length === 2) {
            session.state = 'playing';
            io.to(session.code).emit('game_start', session);
        }
    });

    // Manual Start
    socket.on('start_game', ({ code }) => {
        const session = getSession(code);
        if (!session) return;

        if (session.players.length < 2) return;

        session.state = 'playing';
        io.to(session.code).emit('game_start', session);

        if (session.gameType === 'reflex') {
            session.gameState.phase = 'ready';
            io.to(session.code).emit('game_update', session);

            const delay = Math.random() * 4000 + 2000;
            setTimeout(() => {
                if (session.state === 'playing' && session.gameState.phase === 'ready') {
                    session.gameState.phase = 'go';
                    session.gameState.startTime = Date.now();
                    io.to(session.code).emit('game_update', session);
                }
            }, delay);
        }
    });

    // Game Action
    socket.on('game_action', ({ code, action, payload }) => {
        const session = getSession(code);
        if (!session) return;

        session.lastActivity = Date.now();
        const playerIndex = session.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) return;

        let result = { success: false };
        let updateGame = true;

        if (session.gameType === 'tictactoe' && action === 'move') {
            result = tictactoe.makeMove(session, playerIndex, payload.cellIndex);
        }
        else if (session.gameType === 'rps' && action === 'choice') {
            result = rps.makeMove(session, socket.id, payload.choice);
            if (!result.error) {
                const resolved = rps.resolveRound(session);
                if (resolved) {
                    io.to(code).emit('round_result', session);
                    setTimeout(() => {
                        if (session.state === 'playing') {
                            rps.nextRound(session);
                            io.to(code).emit('game_update', session);
                        }
                    }, 3000);
                    updateGame = false; // Handled above
                }
            }
        }
        else if (session.gameType === 'memory' && action === 'flip') {
            result = memory.makeMove(session, playerIndex, payload.cardIndex);
            if (result.delayedSwitch) {
                setTimeout(() => {
                    memory.resolveMismatch(session);
                    io.to(code).emit('game_update', session);
                }, 1000);
            }
        }
        else if (session.gameType === 'connect4' && action === 'droppiece') {
            result = connect4.makeMove(session, playerIndex, payload.colIndex);
        }
        else if (session.gameType === 'reflex' && action === 'click') {
            result = reflex.handleClick(session, socket.id);
        }
        else if (session.gameType === 'hangman' && action === 'guess') {
            result = hangman.makeGuess(session, playerIndex, payload.letter);
        }

        if (result.error) {
            socket.emit('error', result.error);
        } else if (updateGame) {
            io.to(code).emit('game_update', session);
        }
    });

    // Rematch / Reset
    socket.on('play_again', ({ code }) => {
        const session = getSession(code);
        if (!session) return;

        session.state = 'playing';
        if (session.gameType === 'tictactoe') session.gameState = tictactoe.initGame();
        if (session.gameType === 'rps') session.gameState = rps.initGame();
        if (session.gameType === 'memory') session.gameState = memory.initGame();
        if (session.gameType === 'connect4') session.gameState = connect4.initGame();
        if (session.gameType === 'reflex') session.gameState = reflex.initGame();
        if (session.gameType === 'hangman') session.gameState = hangman.initGame();

        io.to(code).emit('game_reset', session);

        if (session.gameType === 'reflex') {
            session.gameState.phase = 'ready';
            io.to(code).emit('game_update', session);
            setTimeout(() => {
                if (session.state === 'playing' && session.gameState.phase === 'ready') {
                    session.gameState.phase = 'go';
                    session.gameState.startTime = Date.now();
                    io.to(code).emit('game_update', session);
                }
            }, Math.random() * 4000 + 2000);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const result = removePlayer(socket.id);
        if (result) {
            if (result.deleted) {
                console.log(`Session ${result.code} deleted (empty).`);
            } else {
                io.to(result.code).emit('session_update', result.session);
                if (result.session.state === 'playing') {
                    io.to(result.code).emit('player_left', socket.id);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
