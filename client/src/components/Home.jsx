import { useState } from 'react';
import socket from '../socket';
import RulesModal from './RulesModal';

const GAMES = [
    { id: 'tictactoe', name: 'Morpion', icon: '❌⭕', minPlayers: 2, color: 'from-blue-500 to-indigo-500' },
    { id: 'rps', name: 'Chifoumi', icon: '✊✋✌️', minPlayers: 2, color: 'from-pink-500 to-rose-500' },
    { id: 'connect4', name: 'Puissance 4', icon: '🔴🟡', minPlayers: 2, color: 'from-orange-500 to-amber-500' },
    { id: 'memory', name: 'Memory', icon: '🃏', minPlayers: 2, color: 'from-purple-500 to-violet-500' },
    { id: 'reflex', name: 'Réflexe', icon: '⚡', minPlayers: 2, color: 'from-emerald-400 to-cyan-500' },
    { id: 'hangman', name: 'Le Pendu', icon: '😵', minPlayers: 1, color: 'from-gray-500 to-slate-500' },
];

export default function Home({ setSession, setPlayer }) {
    const [name, setName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');
    const [selectedRule, setSelectedRule] = useState(null);

    const createSession = (gameType) => {
        if (!name.trim()) return setError('Choisis un pseudo !');
        socket.emit('create_session', { gameType, playerName: name });
    };

    const joinSession = (e) => {
        e.preventDefault();
        if (!name.trim()) return setError('Choisis un pseudo !');
        if (!joinCode.trim()) return setError('Entre un code de session !');

        socket.emit('join_session', { code: joinCode, playerName: name });
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 pb-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

            <h1 className="text-6xl md:text-8xl font-black mb-12 mt-8 tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] text-center relative z-10">
                PLAY BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse">CODE</span>
            </h1>

            <div className="w-full max-w-6xl space-y-12 fade-in relative z-10">

                {/* User Input Section */}
                <div className="card w-full max-w-lg mx-auto border-t border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <div className="mb-6">
                        <label className="block text-xs font-bold mb-2 ml-1 text-secondary tracking-widest uppercase">Ton Pseudo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            placeholder="Entrez votre nom..."
                            className="input-field text-lg"
                        />
                    </div>
                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm font-bold p-3 rounded-lg mb-4 flex items-center gap-2">⚠️ {error}</div>}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center mb-6">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-sm mb-6">
                            <span className="px-4 bg-slate-900 text-slate-500 font-mono uppercase">Rejoindre une session</span>
                        </div>
                    </div>

                    <form onSubmit={joinSession} className="flex gap-3">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            className="input-field text-center uppercase tracking-[0.2em] font-mono font-bold text-2xl flex-1 border-secondary/30 focus:border-secondary"
                            maxLength={6}
                        />
                        <button type="submit" className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50 font-bold px-8 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            GO
                        </button>
                    </form>
                </div>

                {/* Games Grid */}
                <div>
                    <h2 className="text-center text-slate-400 text-sm font-bold tracking-[0.2em] uppercase mb-8">Sélectionnez un jeu</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                        {GAMES.map((game) => (
                            <div key={game.id} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition duration-500`}></div>
                                <div className="relative h-full bg-slate-900/80 border border-white/5 group-hover:border-white/20 rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden flex flex-col items-center text-center backdrop-blur-sm">
                                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md filter grayscale group-hover:grayscale-0">
                                        {game.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{game.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">{game.minPlayers} Joueurs min</p>

                                    <div className="mt-auto flex gap-3 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => createSession(game.id)}
                                            className={`flex-1 bg-gradient-to-r ${game.color} text-white font-bold py-3 rounded-lg shadow-lg hover:brightness-110 transition active:scale-95`}
                                        >
                                            CRÉER
                                        </button>
                                        <button
                                            onClick={() => setSelectedRule(game.id)}
                                            className="w-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-lg text-slate-300 font-serif italic"
                                            title="Règles"
                                        >
                                            i
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="mt-auto pt-12 text-slate-600 text-xs font-mono">
                PRESS START TO PLAY • NO LOGIN REQUIRED
            </p>

            <RulesModal gameType={selectedRule} onClose={() => setSelectedRule(null)} />
        </div>
    );
}
