import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlayersRank from './PlayersRank';
import { useGameContext } from '../../context/GameContext';

const GameOver = () => {
  const { win, setWin } = useGameContext();
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const players = ['red', 'green']; // Only 2 active players (diagonal)

    if (win.length === 1) { // When 1 player wins, the other loses
      players.forEach(player => {
        if (!win.includes(player)) {
          setWin([...win, player]);
        }
      });
      setGameOver(true);
    }
  }, [win, setWin]);

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border-2 border-yellow-500 shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-yellow-400 mb-2">🎉 Game Over! 🎉</h2>
          <p className="text-gray-300">Congratulations to all players!</p>
        </div>

        <PlayersRank />

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/game-lobby')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
          >
            Exit to Lobby
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;
