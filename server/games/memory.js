function initGame() {
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const cards = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((val, i) => ({ id: i, value: val, flipped: false, matched: false }));

    return {
        cards,
        turnIndex: 0,
        flippedIndices: [], // currently flipped indices in this turn
        scores: { 0: 0, 1: 0 } // playerIndex -> score
    };
}

function makeMove(session, playerIndex, cardIndex) {
    const { gameState } = session;

    // Validations
    if (session.state !== 'playing') return { error: 'Jeu non actif' };
    if (gameState.turnIndex !== playerIndex) return { error: 'Pas votre tour' };
    if (gameState.flippedIndices.length >= 2) return { error: 'Tour en cours' }; // Wait for reset

    const card = gameState.cards[cardIndex];
    if (card.flipped || card.matched) return { error: 'Carte déjà retournée' };

    // Flip card
    card.flipped = true;
    gameState.flippedIndices.push(cardIndex);

    // Check match if 2 cards flipped
    if (gameState.flippedIndices.length === 2) {
        const [idx1, idx2] = gameState.flippedIndices;
        const c1 = gameState.cards[idx1];
        const c2 = gameState.cards[idx2];

        if (c1.value === c2.value) {
            // Match!
            c1.matched = true;
            c2.matched = true;
            gameState.scores[playerIndex]++;
            gameState.flippedIndices = []; // Reset immediately for same player to play again? 
            // Standard rule: Matched = go again? Or next turn? 
            // Let's say: Matched = Same player plays again.

            // Check Win (All matched)
            if (gameState.cards.every(c => c.matched)) {
                session.state = 'finished';
                // Determine winner
                const s0 = gameState.scores[0];
                const s1 = gameState.scores[1];
                gameState.winner = s0 > s1 ? session.players[0].id : (s1 > s0 ? session.players[1].id : 'draw');
            }
        } else {
            // No Match - Wait for next action to flip back? Or auto flip back?
            // Usually we show them for a second then flip back.
            // We will return a specific status to frontend to handle delay, 
            // BUT backend should handle state. 
            // We'll leave them flipped in state, and depend on a "reset_turn" triggered by frontend or timeout?
            // Safer: Backend timeout.
            // No Match - Wait for next action to flip back.
            // We return a specific status to index.js to handle the delay and state update.
            return { success: true, delayedSwitch: true };
        }
    }

    return { success: true };
}

function resolveMismatch(session) {
    const { gameState } = session;
    const [idx1, idx2] = gameState.flippedIndices;
    if (idx1 !== undefined && idx2 !== undefined) {
        gameState.cards[idx1].flipped = false;
        gameState.cards[idx2].flipped = false;
    }
    gameState.flippedIndices = [];
    gameState.turnIndex = (gameState.turnIndex + 1) % 2;
}

module.exports = { initGame, makeMove, resolveMismatch };
