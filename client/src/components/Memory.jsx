import { motion } from 'framer-motion';
import socket from '../socket';

export default function Memory({ session, player }) {
    const { gameState } = session;
    const { cards, scores, turnIndex, winner } = gameState;

    const isMyTurn = session.players[turnIndex].id === player.id;

    const handleCardClick = (index) => {
        if (!isMyTurn || cards[index].flipped || cards[index].matched || winner) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'flip',
            payload: { cardIndex: index }
        });
    };

    const resetGame = () => socket.emit('play_again', { code: session.code });
    const leaveGame = () => window.location.reload();

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
            {/* Scoreboard */}
            <div className="flex justify-between w-full max-w-md mb-8 bg-black/20 p-4 rounded-xl">
                {session.players.map((p, i) => (
                    <div key={p.id} className={`flex flex-col items-center ${turnIndex === i ? 'text-yellow-300 scale-110' : 'text-gray-400'}`}>
                        <span className="font-bold text-lg">{p.name}</span>
                        <span className="text-3xl font-mono">{scores[i]}</span>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-4 gap-3 max-w-md w-full aspect-square ${isMyTurn ? '' : 'opacity-80'}`}>
                {cards.map((card, i) => (
                    <div key={i} className="relative w-full h-full perspective-1000 cursor-pointer" onClick={() => handleCardClick(i)}>
                        <motion.div
                            className="w-full h-full transition-transform duration-500 transform-style-3d"
                            animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                            initial={false}
                        >
                            {/* Front (Hidden) */}
                            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl border-2 border-white/20 shadow-lg flex items-center justify-center">
                                <span className="text-2xl opacity-50">❓</span>
                            </div>
                            {/* Back (Revealed) */}
                            <div className="absolute w-full h-full backface-hidden bg-white text-black rounded-xl border-2 border-white flex items-center justify-center text-4xl shadow-xl transform rotate-y-180">
                                {card.value}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Status / Winner */}
            <div className="mt-8 h-12 text-center">
                {winner ? (
                    <div className="animate-bounce">
                        <h2 className="text-3xl font-black text-green-400">
                            {winner === 'draw' ? 'ÉGALITÉ !' : (winner === player.id ? 'VICTOIRE !' : 'DÉFAITE...')}
                        </h2>
                        <div className="mt-4 flex gap-4 justify-center">
                            <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Rejouer</button>
                            <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600">Retour à l'accueil</button>
                        </div>
                    </div>
                ) : (
                    <div className={`text-xl font-bold ${isMyTurn ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
                        {isMyTurn ? "À toi de jouer !" : `Au tour de ${session.players[turnIndex].name}...`}
                    </div>
                )}
            </div>
        </div>
    );
}

// Add simple CSS helper for 3d transform if not in Tailwind standard
// (Tailwind needs plugin for 3d usually, checking if we can use util classes or style)
// We'll rely on motion animate, but `transform-style-3d` and `backface-hidden` might need custom CSS if not present.
// Let's assume standard CSS in index.css handled this or add inline styles.
// Actually, I'll add the necessary utility classes to index.css in a later step if needed,
// for now let's use style prop for safety on 3D specific props.
