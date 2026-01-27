function initGame() {
    return {
        phase: 'waiting', // waiting (for server), ready (timer started), go (green), finished
        startTime: 0,
        winner: null,
        reactionTime: null,
        falseStarts: [] // ids of players who clicked too early
    };
}

// Logic handled mostly in index.js for timeouts, but helper here
function handleClick(session, playerId) {
    const { gameState } = session;

    if (gameState.phase === 'finished') return { error: 'Déjà fini' };

    if (gameState.phase === 'go') {
        // WINNER!
        gameState.phase = 'finished';
        gameState.winner = playerId;
        gameState.reactionTime = Date.now() - gameState.startTime;
        return { success: true, win: true };
    }

    if (gameState.phase === 'ready') {
        // False start
        if (!gameState.falseStarts.includes(playerId)) {
            gameState.falseStarts.push(playerId);
        }
        return { success: true, falseStart: true };
    }

    return { success: false };
}

module.exports = { initGame, handleClick };
