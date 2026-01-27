function initGame() {
    return {
        round: 1,
        choices: {}, // { playerId: 'rock' | 'paper' | 'scissors' }
        results: null, // { winners: [id], choices: {} } for the round
        scores: {} // { playerId: score }
    };
}

// Resolves a round when everyone has played
function resolveRound(session) {
    const { gameState, players } = session;
    const choices = gameState.choices;

    // Check if all players played
    const allPlayed = players.every(p => choices[p.id]);
    if (!allPlayed) return false;

    // Logic for N players
    // Simplified: Check standard RPS rules. 
    // If only 2 players: classic.
    // If > 2: Everyone who beats everyone else gets a point? 
    // Let's stick to simple elimination or point scoring.
    // Specification said: "Pierre bat Ciseaux", etc.

    // Let's compute points for this round.
    // For each player, compare against every other player.
    // Win = 1 pt.

    const roundScores = {};
    players.forEach(p => roundScores[p.id] = 0);

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const p1 = players[i];
            const p2 = players[j];
            const c1 = choices[p1.id];
            const c2 = choices[p2.id];

            const result = compare(c1, c2);
            if (result === 1) roundScores[p1.id]++;
            if (result === -1) roundScores[p2.id]++;
        }
    }

    // Update global scores
    Object.keys(roundScores).forEach(pid => {
        const p = players.find(pl => pl.id === pid);
        if (p) {
            if (typeof p.score !== 'number') p.score = 0;
            p.score += roundScores[pid];
        }
    });

    gameState.results = {
        choices: { ...choices },
        roundScores
    };

    // Reset choices for next round or finish?
    // Let's wait for "next round" trigger or auto-reset.
    // For now, mark as round resolved.

    return true;
}

function compare(c1, c2) {
    if (c1 === c2) return 0;
    if (
        (c1 === 'rock' && c2 === 'scissors') ||
        (c1 === 'paper' && c2 === 'rock') ||
        (c1 === 'scissors' && c2 === 'paper')
    ) {
        return 1;
    }
    return -1;
}

function makeMove(session, playerId, choice) {
    const { gameState } = session;

    if (session.state !== 'playing') return { error: 'Jeu non actif' };
    if (gameState.results) return { error: 'Manche terminée' }; // Waiting for next round

    gameState.choices[playerId] = choice;
    return { success: true };
}

function nextRound(session) {
    session.gameState.choices = {};
    session.gameState.results = null;
    session.gameState.round++;
}

module.exports = { initGame, makeMove, resolveRound, nextRound };
