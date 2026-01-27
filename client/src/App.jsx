import { useState, useEffect } from 'react';
import socket from './socket';

import Home from './components/Home';
import Lobby from './components/Lobby';
import TicTacToe from './components/TicTacToe';
import RockPaperScissors from './components/RockPaperScissors';
import Memory from './components/Memory';
import Connect4 from './components/Connect4';
import Reflex from './components/Reflex';
import Hangman from './components/Hangman';

function App() {
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null); // { id, name, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Socket Events
    socket.on('connect', () => {
      console.log('Connected');
      setLoading(false);
    });

    const handleSessionUpdate = (updatedSession) => {
      setSession(updatedSession);
      if (player) {
        const me = updatedSession.players.find(p => p.id === player.id);
        if (me) setPlayer(me);
      }
    };

    socket.on('session_created', ({ code, playerId, session }) => {
      setSession(session);
      const p = session.players.find(p => p.id === playerId);
      setPlayer(p);
    });

    socket.on('session_joined', ({ code, playerId, session }) => {
      setSession(session);
      const p = session.players.find(p => p.id === playerId);
      setPlayer(p);
    });

    socket.on('session_update', handleSessionUpdate);
    socket.on('game_start', (s) => setSession(s));
    socket.on('game_update', (s) => setSession(s));
    socket.on('round_result', (s) => setSession(s));
    socket.on('game_reset', (s) => setSession(s));

    socket.on('player_left', (socketId) => console.log('Player left:', socketId));
    socket.on('error', (msg) => alert(msg));

    return () => {
      socket.off('connect');
      socket.off('session_created');
      socket.off('session_joined');
      socket.off('session_update');
      socket.off('game_start');
      socket.off('game_update');
      socket.off('round_result');
      socket.off('game_reset');
      socket.off('player_left');
      socket.off('error');
    };
  }, [player]);

  // View Logic
  // 1. Loading
  // 2. Home (No session)
  // 3. Lobby (Session waiting)
  // 4. Game (Session playing/finished)

  if (!session) {
    return <Home setSession={setSession} setPlayer={setPlayer} />;
  }

  if (session.state === 'waiting') {
    return <Lobby session={session} player={player} />;
  }

  if (session.state === 'playing' || session.state === 'finished') {
    switch (session.gameType) {
      case 'tictactoe': return <TicTacToe session={session} player={player} />;
      case 'rps': return <RockPaperScissors session={session} player={player} />;
      case 'memory': return <Memory session={session} player={player} />;
      case 'connect4': return <Connect4 session={session} player={player} />;
      case 'reflex': return <Reflex session={session} player={player} />;
      case 'hangman': return <Hangman session={session} player={player} />;
      default: return <div>Jeu inconnu</div>;
    }
  }

  return <div className="text-white">Chargement...</div>;
}

export default App;
