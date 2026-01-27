const WORDS = ['ELEPHANT', 'GIRAFE', 'ORDINATEUR', 'PROGRAMME', 'JAVASCRIPT', 'BANANE', 'VOITURE', 'MUSIQUE', 'PLANETE', 'OCEAN'];

function initGame() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    return {
        word,
        hiddenWord: word.split('').map(() => '_'),
        guessedLetters: [],
        lives: 6,
        turnIndex: 0,
        winner: null, // 'players' or 'hangman'
        gameOver: false
    };
}

function makeGuess(session, playerIndex, letter) {
    const { gameState } = session;

    if (session.state !== 'playing') return { error: 'Jeu non actif' };
    if (gameState.gameOver) return { error: 'Partie terminée' };
    if (gameState.turnIndex !== playerIndex) return { error: 'Pas votre tour' };

    letter = letter.toUpperCase();
    if (gameState.guessedLetters.includes(letter)) return { error: 'Lettre déjà tentée' };

    gameState.guessedLetters.push(letter);

    if (gameState.word.includes(letter)) {
        // Correct guess
        for (let i = 0; i < gameState.word.length; i++) {
            if (gameState.word[i] === letter) {
                gameState.hiddenWord[i] = letter;
            }
        }

        // Check Win
        if (!gameState.hiddenWord.includes('_')) {
            gameState.winner = 'players';
            gameState.gameOver = true;
            session.state = 'finished';
        }
        // Bonus: Keep turn if correct? Let's say yes for Co-op feel.
    } else {
        // Wrong guess
        gameState.lives--;
        if (gameState.lives <= 0) {
            gameState.winner = 'hangman';
            gameState.gameOver = true;
            session.state = 'finished';
        }
        // Pass turn
        gameState.turnIndex = (gameState.turnIndex + 1) % session.players.length;
    }

    return { success: true };
}

module.exports = { initGame, makeGuess };
