import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const GamePlay = () => {
  const { roomCode } = useParams();
  const [gameState, setGameState] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Game Room: {roomCode}</h1>
        <p className="text-gray-400">Game implementation coming soon...</p>
        <p className="text-gray-400 mt-2">This will include the full Ludo board with animations</p>
      </div>
    </div>
  );
};

export default GamePlay;
