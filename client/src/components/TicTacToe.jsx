import socket from '../socket';

export default function TicTacToe({ session, player }) {
    const { gameState } = session;
    const { board, winner, winningLine } = gameState;

    const mySymbol = session.players.find(p => p.id === player.id)?.symbol;
    const isMyTurn = session.players[gameState.turnIndex]?.id === player.id;
    const opponent = session.players.find(p => p.id !== player.id);

    const handleCellClick = (index) => {
        if (!isMyTurn || board[index] || winner) return;
        socket.emit('game_action', {
            code: session.code,
            action: 'move',
            payload: { cellIndex: index }
        });
    };

    const resetGame = () => {
        socket.emit('play_again', { code: session.code });
    };

    const leaveGame = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="flex justify-between w-full max-w-sm mb-6 text-xl font-bold">
                <div className={`flex flex-col items-center ${gameState.turnIndex === 0 ? 'text-green-400 scale-110' : 'text-gray-400'}`}>
                    <span>{session.players[0].name} (X)</span>
                </div>
                <div className="text-gray-600">VS</div>
                <div className={`flex flex-col items-center ${gameState.turnIndex === 1 ? 'text-green-400 scale-110' : 'text-gray-400'}`}>
                    <span>{session.players[1].name} (O)</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-sm">
                {board.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => handleCellClick(i)}
                        disabled={!!cell || !isMyTurn || !!winner}
                        className={`
                            w-24 h-24 sm:w-28 sm:h-28 rounded-xl text-5xl font-black 
                            flex items-center justify-center transition-all duration-200
                            ${cell ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}
                            ${!cell && isMyTurn && !winner ? 'cursor-pointer' : 'cursor-default'}
                            ${winningLine?.includes(i) ? 'bg-green-500/50 scale-105' : ''}
                            ${cell === 'X' ? 'text-blue-300' : 'text-pink-300'}
                        `}
                    >
                        {cell}
                    </button>
                ))}
            </div>

            <div className="mt-8 h-16 flex items-center justify-center">
                {winner ? (
                    <div className="text-center animate-bounce">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            {winner === 'draw' ? 'MATCH NUL !' : (winner === player.id ? 'VICTOIRE !' : 'DÉFAITE...')}
                        </h2>
                        <div className="mt-4 flex gap-4 justify-center">
                            <button onClick={resetGame} className="btn-primary text-sm py-2 px-4">Rejouer</button>
                            <button onClick={leaveGame} className="btn-secondary text-sm py-2 px-4 bg-gray-600 hover:bg-gray-700">Retour à l'accueil</button>
                        </div>
                    </div>
                ) : (
                    <div className={`text-xl font-bold ${isMyTurn ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
                        {isMyTurn ? "C'est à toi !" : `Au tour de ${session.players[gameState.turnIndex]?.name}...`}
                    </div>
                )}
            </div>
        </div>
    );
}
