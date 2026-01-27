function initGame() {
    return {
        board: Array(6).fill(null).map(() => Array(7).fill(null)), // 6 rows, 7 cols. [row][col]
        turnIndex: 0,
        winner: null,
        winningCells: [] // [{r, c}]
    };
}

function makeMove(session, playerIndex, colIndex) {
    const { gameState } = session;

    if (session.state !== 'playing') return { error: 'Jeu non actif' };
    if (gameState.winner) return { error: 'Jeu terminé' };
    if (gameState.turnIndex !== playerIndex) return { error: 'Pas votre tour' };
    if (colIndex < 0 || colIndex > 6) return { error: 'Colonne invalide' };

    // Find lowest empty row in col
    let rowToPlace = -1;
    for (let r = 5; r >= 0; r--) {
        if (gameState.board[r][colIndex] === null) {
            rowToPlace = r;
            break;
        }
    }

    if (rowToPlace === -1) return { error: 'Colonne pleine' };

    const symbol = playerIndex === 0 ? '🔴' : '🟡';
    gameState.board[rowToPlace][colIndex] = symbol;

    // Check Win
    if (checkWin(gameState.board, rowToPlace, colIndex, symbol)) {
        gameState.winner = session.players[playerIndex].id;
        session.state = 'finished';
    } else if (gameState.board.every(row => row.every(cell => cell !== null))) {
        gameState.winner = 'draw';
        session.state = 'finished';
    } else {
        gameState.turnIndex = (gameState.turnIndex + 1) % 2;
    }

    return { success: true };
}

function checkWin(board, r, c, symbol) {
    // Check directions: Horizontal, Vertical, Diagonal /, Diagonal \
    const directions = [
        [[0, 1], [0, -1]], // Horizontal
        [[1, 0], [-1, 0]], // Vertical
        [[1, 1], [-1, -1]], // Diag \ (since row 0 is top) -> actually this is Diag / visual if row 5 is bottom. Let's just check all deltas.
        [[1, -1], [-1, 1]] // Diag /
    ];

    for (const axis of directions) {
        let count = 1;
        for (const [dr, dc] of axis) {
            let nr = r + dr;
            let nc = c + dc;
            while (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === symbol) {
                count++;
                nr += dr;
                nc += dc;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

module.exports = { initGame, makeMove };
