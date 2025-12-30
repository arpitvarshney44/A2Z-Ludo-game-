import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Board from '../components/game/Board';
import Dice from '../components/game/Dice';
import { GameProvider, useGameContext } from '../context/GameContext';
import GameOver from '../components/game/GameOver';
import { gameAPI } from '../services/api';
import '../styles/game.css';

const GameContent = ({ roomCode, navigate }) => {
  const { 
    currentPlayer, 
    isMyTurn, 
    myColor, 
    gameStatus, 
    players: socketPlayers
  } = useGameContext();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await gameAPI.getGameByRoomCode(roomCode);
        setGameData(response.data.game);
      } catch (error) {
        console.error('Failed to fetch game:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
    
    // Refresh game data every 5 seconds (reduced since socket handles real-time)
    const interval = setInterval(fetchGameData, 5000);
    return () => clearInterval(interval);
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  // Use socket players if available, otherwise fall back to API data
  const players = socketPlayers.length > 0 ? socketPlayers : (gameData?.players || []);
  const redPlayer = players.find((p) => p.color === 'red');
  const greenPlayer = players.find((p) => p.color === 'green');

  const redPlayerName = redPlayer?.username || 'Waiting...';
  const greenPlayerName = greenPlayer?.username || 'Waiting...';
  const redPlayerAvatar = redPlayer?.avatar || `https://ui-avatars.com/api/?name=R&background=FF0800&color=fff&size=100`;
  const greenPlayerAvatar = greenPlayer?.avatar || `https://ui-avatars.com/api/?name=G&background=4CBB17&color=fff&size=100`;

  const currentPlayerName = currentPlayer === 'red' ? redPlayerName : greenPlayerName;
  const currentPlayerAvatar = currentPlayer === 'red' ? redPlayerAvatar : greenPlayerAvatar;

  // Show waiting screen if game hasn't started
  if (gameStatus === 'waiting' && players.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
        <div className="text-white text-2xl mb-4">Waiting for opponent...</div>
        <div className="text-gray-400 text-lg mb-8">Room Code: {roomCode}</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <button 
          onClick={() => navigate('/game-lobby')} 
          className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Leave Room
        </button>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <GameOver />

      {/* Header */}
      <div className="game-header-new">
        <button onClick={() => navigate('/game-lobby')} className="back-btn-new">
          ← Back
        </button>
        <div className="room-code-new">Room: {roomCode}</div>
        <div className="prize-badge">
          <span className="prize-icon">🏆</span>
          <span className="prize-text">₹{gameData?.prizePool || 0}</span>
        </div>
      </div>

      {/* Your Color Indicator */}
      {myColor && (
        <div className="text-center py-2">
          <span className="text-white text-sm">
            You are playing as: 
            <span className={`ml-2 font-bold ${myColor === 'red' ? 'text-red-500' : 'text-green-500'}`}>
              {myColor.toUpperCase()}
            </span>
            {isMyTurn && <span className="ml-2 text-yellow-400 animate-pulse">- Your Turn!</span>}
          </span>
        </div>
      )}

      {/* Game Board with Player Labels */}
      <div className="game-board-container">
        <div className="board-wrapper">
          {/* Red Player Label - Bottom Left */}
          <div className={`player-label player-label-red ${currentPlayer === 'red' ? 'active' : ''}`}>
            <img src={redPlayerAvatar} alt={redPlayerName} className="player-label-avatar" />
            <span className="player-label-name">{redPlayerName}</span>
            {currentPlayer === 'red' && <span className="player-turn-badge">🎲</span>}
          </div>

          {/* Green Player Label - Top Right */}
          <div className={`player-label player-label-green ${currentPlayer === 'green' ? 'active' : ''}`}>
            <img src={greenPlayerAvatar} alt={greenPlayerName} className="player-label-avatar" />
            <span className="player-label-name">{greenPlayerName}</span>
            {currentPlayer === 'green' && <span className="player-turn-badge">🎲</span>}
          </div>

          <Board />
        </div>
      </div>

      {/* Dice Section with Current Player */}
      <div className="dice-section">
        <div className="current-turn-info">
          <img src={currentPlayerAvatar} alt={currentPlayerName} className="turn-avatar" />
          <div className="turn-details">
            <span className="turn-name">{currentPlayerName}</span>
            <span className={`turn-color ${currentPlayer}-color`}>
              {currentPlayer.toUpperCase()}'s Turn
              {isMyTurn && ' (You)'}
            </span>
          </div>
        </div>
        <div className="dice-box">
          <Dice />
        </div>
      </div>
    </div>
  );
};

const Game = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  return (
    <GameProvider roomCode={roomCode}>
      <GameContent roomCode={roomCode} navigate={navigate} />
    </GameProvider>
  );
};

export default Game;
