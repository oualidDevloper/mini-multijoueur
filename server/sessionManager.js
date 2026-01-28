const sessions = new Map();

// Helper to generate 6-char random code
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function createSession(gameType) {
    let code = generateCode();
    while (sessions.has(code)) {
        code = generateCode();
    }

    const session = {
        code,
        gameType,
        players: [], // { id, name, socketId, symbol/ready }
        state: 'waiting', // waiting, playing, finished
        gameState: null, // Specific game state
        createdAt: Date.now(),
        lastActivity: Date.now()
    };

    sessions.set(code, session);
    return session;
}

function getSession(code) {
    // Case insensitive lookup
    return sessions.get(code.toUpperCase());
}

function joinSession(code, player) {
    const session = getSession(code);
    if (!session) return { error: 'Session introuvable.' };

    // Check max players based on game type
    let maxPlayers = 2;
    if (['rps', 'reflex', 'hangman'].includes(session.gameType)) {
        maxPlayers = 10;
    }

    if (session.players.length >= maxPlayers) {
        return { error: 'Session complète.' };
    }

    if (session.state !== 'waiting') {
        // Allow rejoin? For now, no.
        return { error: 'Partie déjà en cours.' };
    }

    // Add player
    const newPlayer = {
        ...player, // id, name
        score: 0,
        ready: false
    };

    session.players.push(newPlayer);
    session.lastActivity = Date.now();

    return { session };
}

function removePlayer(socketId) {
    for (const [code, session] of sessions) {
        const index = session.players.findIndex(p => p.socketId === socketId);
        if (index !== -1) {
            session.players.splice(index, 1);
            session.lastActivity = Date.now();

            // If empty, delete session immediately (or wait for cleanup)
            if (session.players.length === 0) {
                sessions.delete(code);
                return { code, deleted: true };
            }
            return { code, session };
        }
    }
    return null;
}

// Cleanup old sessions (every 30 mins, etc)
function cleanupSessions() {
    const now = Date.now();
    for (const [code, session] of sessions) {
        // 1 hour inactive
        if (now - session.lastActivity > 60 * 60 * 1000) {
            sessions.delete(code);
        }
    }
}

module.exports = {
    createSession,
    getSession,
    joinSession,
    removePlayer,
    cleanupSessions
};
