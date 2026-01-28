import socket from '../socket';

export default function Lobby({ session, player }) {
    const copyCode = () => {
        navigator.clipboard.writeText(session.code);
    };

    const isCreator = session.players[0]?.id === player.id;

    // Helper to generate consistent avatar color from name
    const getAvatarColor = (name) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getMaxPlayers = () => {
        if (['rps', 'reflex', 'hangman'].includes(session.gameType)) return 10;
        return 2;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center relative">
            <button
                onClick={() => window.location.reload()}
                className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors"
                title="Retour à l'accueil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            <h1 className="text-2xl font-black mb-6 tracking-tighter text-white/20 uppercase select-none">
                Lobby
            </h1>

            <div className="card w-full max-w-md space-y-6 fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-white/10 p-6">
                <div className="space-y-2">
                    <p className="text-secondary text-[10px] font-bold tracking-[0.2em] uppercase">Code de session</p>
                    <div
                        onClick={copyCode}
                        className="relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative bg-black/40 border border-white/10 p-4 rounded-xl font-mono text-5xl font-black tracking-widest text-white group-hover:text-primary transition-colors select-all">
                            {session.code}
                        </div>
                        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] text-white/50">
                            COPIER
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 min-h-[150px] border border-white/5">
                    <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                        <h3 className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joueurs connectés</h3>
                        <span className="text-[10px] font-mono text-slate-600">{session.players.length} / {getMaxPlayers()}</span>
                    </div>

                    <ul className="space-y-2">
                        {session.players.map((p) => (
                            <li key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm ${getAvatarColor(p.name)}`}>
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold text-sm ${p.id === player.id ? 'text-primary' : 'text-slate-200'}`}>
                                            {p.name} {p.id === player.id && '(Moi)'}
                                        </div>
                                        {session.gameType === 'tictactoe' && p.symbol && (
                                            <div className="text-[10px] text-slate-500 font-mono">Symbole: {p.symbol}</div>
                                        )}
                                    </div>
                                </div>

                                {p.id === session.players[0].id && (
                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">HÔTE</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Game Status / Start Button */}
                {session.gameType === 'tictactoe' || session.gameType === 'connect4' || session.gameType === 'memory' ? (
                    <div className="text-secondary font-medium animate-pulse tracking-widest uppercase text-xs">
                        En attente d'un adversaire...
                    </div>
                ) : (
                    <div className="pt-2">
                        {isCreator ? (
                            <button
                                onClick={() => socket.emit('start_game', { code: session.code })}
                                disabled={session.players.length < 2}
                                className="w-full btn-primary disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed text-lg py-3"
                            >
                                {session.players.length < 2 ? "En attente de joueurs..." : "COMMENCER"}
                            </button>
                        ) : (
                            <div className="text-slate-400 font-mono text-xs animate-pulse">
                                {session.players.length < 2 ? "En attente d'autres joueurs..." : "En attente du chef de salle..."}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
