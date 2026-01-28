import { useState } from 'react';
import socket from '../socket';

export default function RockPaperScissors({ session, player }) {
    const { gameState } = session;
    const { round, results } = gameState; // results: { choices, roundScores }
    const myChoice = gameState.choices?.[player.id];

    // Waiting for others if I made a choice but no results yet
    const waiting = myChoice && !results;

    const handleChoice = (choice) => {
        if (myChoice || results) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'choice',
            payload: { choice }
        });
    };

    const resetGame = () => {
        socket.emit('play_again', { code: session.code });
    };

    const leaveGame = () => {
        window.location.reload();
    };

    const getIcon = (choice) => {
        if (choice === 'rock') return '✊';
        if (choice === 'paper') return '✋';
        if (choice === 'scissors') return '✌️';
        return '?';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <button
                onClick={() => window.location.reload()}
                className="fixed top-4 left-4 p-2 text-white/50 hover:text-white transition-colors z-50"
                title="Retour à l'accueil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <h2 className="text-3xl font-bold mb-2">Manche {round}</h2>

            <div className="flex flex-wrap justify-center gap-6 mb-12 w-full max-w-4xl">
                {session.players.map(p => (
                    <div key={p.id} className="flex flex-col items-center bg-black/20 p-4 rounded-xl min-w-[100px]">
                        <span className="font-bold mb-2">{p.name} {p.id === player.id && '(Toi)'}</span>
                        <div className="text-4xl bg-white/10 w-16 h-16 flex items-center justify-center rounded-full">
                            {results ? getIcon(results.choices[p.id]) : (gameState.choices?.[p.id] ? '✅' : '⏳')}
                        </div>
                        <span className="mt-2 text-yellow-400 font-mono text-xl">{p.score} pts</span>
                    </div>
                ))}
            </div>

            <div className="h-16 mb-8 text-center">
                {results ? (
                    <div className="fade-in">
                        <h3 className="text-2xl font-bold mb-2">Résultats !</h3>
                        <p className="text-sm text-gray-300">Prochaine manche dans quelques secondes...</p>
                        <div className="mt-4 flex gap-4 justify-center">
                            <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Reset Total</button>
                            <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600 hover:bg-gray-700">Retour à l'accueil</button>
                        </div>
                    </div>
                ) : (
                    waiting ? (
                        <p className="text-xl animate-pulse text-yellow-300">En attente des autres joueurs...</p>
                    ) : (
                        <p className="text-xl font-bold">Fais ton choix !</p>
                    )
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl px-4">
                {['rock', 'paper', 'scissors'].map((choice) => (
                    <button
                        key={choice}
                        onClick={() => handleChoice(choice)}
                        disabled={!!myChoice || !!results}
                        className={`
                            flex flex-col items-center justify-center py-8 rounded-2xl text-6xl shadow-xl transition-all
                            ${(myChoice === choice) ? 'bg-blue-500 ring-4 ring-white scale-105' : 'bg-white/10 hover:bg-white/20 active:scale-95'}
                            ${(myChoice && myChoice !== choice) ? 'opacity-50 blur-sm' : 'opacity-100'}
                            disabled:cursor-default
                        `}
                    >
                        <span>{getIcon(choice)}</span>
                        <span className="text-base font-bold mt-2 uppercase tracking-wider text-white/80">{choice}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
