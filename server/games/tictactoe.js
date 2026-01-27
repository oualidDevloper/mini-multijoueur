function initGame() {
    return {
        board: Array(9).fill(null), // 0-8
        turnIndex: 0, // 0 or 1 (index of player in players array)
        winner: null, // playerID or 'draw'
        winningLine: null
    };
}

function makeMove(session, playerIndex, cellIndex) {
    const { gameState } = session;

    // Validation
    if (session.state !== 'playing') return { error: 'Jeu non actif' };
    if (gameState.winner) return { error: 'Jeu terminé' };
    if (gameState.turnIndex !== playerIndex) return { error: 'Pas votre tour' };
    if (gameState.board[cellIndex] !== null) return { error: 'Case occupée' };

    // Move
    const symbol = playerIndex === 0 ? 'X' : 'O';
    gameState.board[cellIndex] = symbol;

    // Check Win
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diags
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
            gameState.winner = session.players[playerIndex].id;
            gameState.winningLine = line;
            session.state = 'finished';
            return { success: true };
        }
    }

    // Check Draw
    if (!gameState.board.includes(null)) {
        gameState.winner = 'draw';
        session.state = 'finished';
        return { success: true };
    }

    // Next turn
    gameState.turnIndex = (gameState.turnIndex + 1) % 2;
    return { success: true };
}

module.exports = { initGame, makeMove };
