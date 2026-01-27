import { useState } from 'react';
import socket from '../socket';

export default function Hangman({ session, player }) {
    const { gameState } = session;
    const { hiddenWord, lives, guessedLetters, winner, turnIndex } = gameState;

    const isMyTurn = session.players[turnIndex]?.id === player.id;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const handleGuess = (letter) => {
        if (!isMyTurn || winner || guessedLetters.includes(letter)) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'guess',
            payload: { letter }
        });
    };

    const resetGame = () => socket.emit('play_again', { code: session.code });
    const leaveGame = () => window.location.reload();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {/* Lives / Drawing */}
            <div className="text-center mb-8">
                <span className="text-6xl mb-2 block">
                    {lives === 6 && '😀'}
                    {lives === 5 && '🙂'}
                    {lives === 4 && '😐'}
                    {lives === 3 && '😟'}
                    {lives === 2 && '😨'}
                    {lives === 1 && '😱'}
                    {lives === 0 && '💀'}
                </span>
                <p className={`font-bold ${lives < 3 ? 'text-red-500' : 'text-green-400'}`}>
                    Vies restantes : {lives}
                </p>
            </div>

            {/* Word Display */}
            <div className="flex gap-2 sm:gap-4 mb-12 flex-wrap justify-center">
                {hiddenWord.map((l, i) => (
                    <div key={i} className="w-10 h-14 sm:w-16 sm:h-20 border-b-4 border-white flex items-center justify-center text-4xl font-bold font-mono">
                        {l === '_' ? '' : l}
                    </div>
                ))}
            </div>

            {/* Turn Indicator or Result */}
            <div className="h-20 text-center mb-4">
                {winner ? (
                    <div className="animate-bounce">
                        <h2 className="text-3xl font-black mb-2">
                            {winner === 'players' ? 'BRAVO ! VOUS AVEZ GAGNÉ !' : `PERDU... Le mot était ${gameState.word}`}
                        </h2>
                        <div className="flex gap-4 justify-center">
                            <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Rejouer</button>
                            <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600">Quitter</button>
                        </div>
                    </div>
                ) : (
                    <div className={`text-xl font-bold ${isMyTurn ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
                        {isMyTurn ? "Choisis une lettre !" : `Au tour de ${session.players[turnIndex].name}...`}
                    </div>
                )}
            </div>

            {/* Keyboard */}
            <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
                {alphabet.map((letter) => {
                    const used = guessedLetters.includes(letter);
                    return (
                        <button
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={used || !isMyTurn || !!winner}
                            className={`
                                w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-lg
                                transition-all duration-200
                                ${used ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white/20 hover:bg-white/40 text-white shadow-lg'}
                                ${isMyTurn && !used && !winner ? 'hover:scale-110 active:scale-95' : ''}
                            `}
                        >
                            {letter}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
