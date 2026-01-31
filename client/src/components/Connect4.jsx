import { motion } from 'framer-motion';
import socket from '../socket';

export default function Connect4({ session, player }) {
    const { gameState } = session;
    const { board, winner } = gameState;

    const myIndex = session.players.findIndex(p => p.id === player.id);
    const isMyTurn = session.players[gameState.turnIndex]?.id === player.id;
    const mySymbol = myIndex === 0 ? '🔴' : '🟡'; // Red vs Yellow

    const handleDrop = (colIndex) => {
        if (!isMyTurn || winner) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'droppiece',
            payload: { colIndex }
        });
    };

    const resetGame = () => socket.emit('play_again', { code: session.code });
    const leaveGame = () => window.location.reload();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-52">
            <button
                onClick={() => window.location.reload()}
                className="fixed top-4 left-4 p-2 text-white/50 hover:text-white transition-colors z-50"
                title="Retour à l'accueil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="flex justify-between w-full max-w-sm mb-6 text-xl font-bold">
                <div className={`flex flex-col items-center ${gameState.turnIndex === 0 ? 'text-red-400 scale-110' : 'text-gray-400'}`}>
                    <span>🔴 {session.players[0].name}</span>
                </div>
                <div className={`flex flex-col items-center ${gameState.turnIndex === 1 ? 'text-yellow-400 scale-110' : 'text-gray-400'}`}>
                    <span>🟡 {session.players[1].name}</span>
                </div>
            </div>

            {/* Board */}
            <div className="bg-blue-700 p-4 rounded-xl shadow-2xl inline-block relative">
                {/* Clickable Columns Overlay */}
                <div className="absolute inset-0 z-10 flex">
                    {[...Array(7)].map((_, col) => (
                        <div
                            key={col}
                            onClick={() => handleDrop(col)}
                            className="flex-1 h-full cursor-pointer hover:bg-white/5 transition-colors group"
                        >
                            {/* Hover Indicator */}
                            {isMyTurn && !winner && (
                                <div className="hidden group-hover:block absolute -top-8 w-10 h-10 rounded-full bg-white/50 left-0 transform translate-x-1/2 ml-[calc(100%/7*${col}-50%)]"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-rows-6 gap-2">
                    {board.map((row, r) => (
                        <div key={r} className="grid grid-cols-7 gap-2">
                            {row.map((cell, c) => (
                                <div key={c} className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-900 shadow-inner flex items-center justify-center overflow-hidden">
                                    {cell && (
                                        <motion.div
                                            initial={{ y: -300, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="w-full h-full rounded-full"
                                            style={{ backgroundColor: cell === '🔴' ? '#ef4444' : '#eab308' }} // red-500, yellow-500
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 h-16 flex items-center justify-center">
                {winner ? (
                    <div className="text-center animate-bounce">
                        <h2 className="text-3xl font-black text-white">
                            {winner === 'draw' ? 'MATCH NUL !' : (winner === player.id ? 'VICTOIRE !' : 'DÉFAITE...')}
                        </h2>
                        <div className="mt-4 flex gap-4 justify-center">
                            <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Rejouer</button>
                            <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600">Retour à l'accueil</button>
                        </div>
                    </div>
                ) : (
                    <div className={`text-xl font-bold ${isMyTurn ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
                        {isMyTurn ? "À toi de jouer (Clique sur une colonne)" : `Au tour de ${session.players[gameState.turnIndex].name}...`}
                    </div>
                )}
            </div>
        </div>
    );
}
