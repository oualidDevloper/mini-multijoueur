import socket from '../socket';

export default function Reflex({ session, player }) {
    const { gameState } = session;
    const { phase, reactionTime, winner, falseStarts } = gameState;

    const amIFalsed = falseStarts.includes(socket.id);

    const handleClick = () => {
        if (!socket) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'click'
        });
    };

    const resetGame = () => socket.emit('play_again', { code: session.code });
    const leaveGame = () => window.location.reload();

    let bgColor = 'bg-gray-700';
    let message = "Attends le signal...";

    if (phase === 'ready') {
        bgColor = 'bg-red-600';
        message = "PRÊT... (Ne clique pas !)";
    } else if (phase === 'go') {
        bgColor = 'bg-green-500';
        message = "CLICK MAINTENANT !";
    } else if (phase === 'finished') {
        bgColor = 'bg-blue-600';
    }

    if (amIFalsed) {
        bgColor = 'bg-gray-900';
        message = "FAUX DÉPART ! 🚫";
    }

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen w-full transition-colors duration-200 ${bgColor} p-4 text-center`}>
            <button
                onClick={() => window.location.reload()}
                className="fixed top-4 left-4 p-2 text-white/50 hover:text-white transition-colors z-50"
                title="Retour à l'accueil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            {phase !== 'finished' ? (
                <button
                    onMouseDown={handleClick} // MouseDown for faster reaction than Click
                    disabled={amIFalsed}
                    className="w-full max-w-lg aspect-square rounded-full flex flex-col items-center justify-center active:scale-95 transition-transform"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg select-none">
                        {message}
                    </h1>
                    {phase === 'ready' && <p className="mt-4 text-white/50">Attends le vert...</p>}
                </button>
            ) : (
                <div className="card max-w-lg w-full p-8 animate-bounce bg-white/10 backdrop-blur-md">
                    <h2 className="text-4xl font-bold mb-4">
                        {winner === player.id ? "🏆 TU AS GAGNÉ !" : "PERDU !"}
                    </h2>
                    <p className="text-2xl font-mono mb-6">
                        Temps : {reactionTime}ms
                    </p>
                    <p className="text-gray-300 mb-8">
                        Vainqueur : {session.players.find(p => p.id === winner)?.name}
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Rejouer</button>
                        <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600">Retour à l'accueil</button>
                    </div>
                </div>
            )}

            {!['finished', 'go'].includes(phase) && !amIFalsed && (
                <p className="fixed bottom-10 text-white/50 text-sm">Clique le plus vite possible quand l'écran devient VERT.</p>
            )}
        </div>
    );
}
