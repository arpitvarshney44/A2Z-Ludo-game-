 import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaTrophy, FaUsers, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { gameAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getCommissionRate } from '../utils/config';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);

  useEffect(() => {
    fetchAvailableGames();
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    const rate = await getCommissionRate();
    setCommissionRate(rate);
  };

  const fetchAvailableGames = async () => {
    try {
      const response = await gameAPI.getAvailableGames();
      setAvailableGames(response.data.games);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const handlePlayNow = () => {
    navigate('/game-lobby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 rounded-b-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-4xl animate-bounce">🎮</span>
              <h1 className="text-4xl font-black text-white">
                Welcome Back!
              </h1>
              <span className="text-4xl animate-bounce animation-delay-1000">🎲</span>
            </div>
            <p className="text-white/90 text-lg font-semibold">
              Play • Win • Earn Real Money 💰
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
            >
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-2xl font-black text-white">{user?.totalGamesPlayed || 0}</p>
              <p className="text-white/80 text-xs font-semibold">Games</p>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
            >
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-2xl font-black text-yellow-300">{user?.totalGamesWon || 0}</p>
              <p className="text-white/80 text-xs font-semibold">Wins</p>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
            >
              <div className="text-3xl mb-1">💎</div>
              <p className="text-2xl font-black text-green-300">₹{user?.totalCoinsWon || 0}</p>
              <p className="text-white/80 text-xs font-semibold">Earned</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mt-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-4 shadow-xl border-2 border-green-300"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <p className="text-white text-sm font-semibold leading-tight">
            <span className="font-black">{commissionRate}% Commission</span> • <span className="font-black">3% Referral</span> • <span className="font-black">24/7 Withdrawal</span> • <span className="font-black">WhatsApp Support 📞</span>
          </p>
        </div>
      </motion.div>

      {/* Main Game Card */}
      <div className="p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer group"
          onClick={handlePlayNow}
        >
          <div className="absolute inset-0 bg-[url('/ludo-pattern.png')] opacity-10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl">🎲</span>
                  <h2 className="text-4xl font-black text-white">LUDO</h2>
                </div>
                <p className="text-white/90 font-bold text-lg">Classic Game Mode</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                    🔥 LIVE NOW
                  </span>
                </div>
              </div>
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/40 group-hover:scale-110 transition-transform">
                <FaTrophy className="text-5xl text-white drop-shadow-lg" />
              </div>
            </div>
            
            <button className="w-full bg-white text-orange-600 font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-yellow-50 transition-all shadow-xl group-hover:shadow-2xl">
              <FaPlay className="text-2xl" />
              PLAY NOW
              
            </button>
          </div>
        </motion.div>

        {/* Support Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="mt-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-[2rem] p-5 shadow-2xl border-2 border-green-300"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaWhatsapp className="text-3xl text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-white mb-0.5">24/7 SUPPORT</h3>
                <p className="text-white/90 text-sm font-semibold">Always here to help</p>
              </div>
            </div>
            <a
              href="https://wa.me/918441952800"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-600 px-5 py-2.5 rounded-xl font-bold hover:scale-110 transition-transform shadow-lg whitespace-nowrap flex-shrink-0"
            >
              Chat
            </a>
          </div>
        </motion.div>
      </div>

      {/* Available Games */}
      {availableGames.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-3xl">🎮</span>
              Live Games
            </h3>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              • LIVE
            </span>
          </div>
          <div className="space-y-3">
            {availableGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 border-2 border-purple-400 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-black text-sm">
                        {game.roomCode}
                      </span>
                      <span className="text-yellow-300 text-xl">💰</span>
                    </div>
                    <p className="text-white font-bold">
                      Entry: <span className="text-yellow-300">₹{game.entryFee}</span>
                    </p>
                    <p className="text-white/80 text-sm">
                      Prize: <span className="text-green-300 font-bold">₹{game.prizePool}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl mb-3">
                      <p className="text-yellow-300 font-black text-xl">
                        {game.currentPlayers}/{game.maxPlayers}
                      </p>
                      <p className="text-white/80 text-xs">Players</p>
                    </div>
                    <button
                      onClick={() => navigate(`/game/${game.roomCode}`)}
                      className="bg-white text-purple-600 px-6 py-2 rounded-xl text-sm font-black hover:scale-110 transition-transform shadow-lg"
                    >
                      JOIN →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="p-4 pb-24">
        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <span className="text-3xl">✨</span>
          Why Choose Us?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-center border-2 border-blue-400 shadow-xl"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-white/40">
              <FaTrophy className="text-3xl text-white" />
            </div>
            <p className="text-white font-black text-lg">Fair Play</p>
            <p className="text-blue-100 text-xs mt-1 font-semibold">100% Secure</p>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-center border-2 border-green-400 shadow-xl"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-white/40">
              <FaUsers className="text-3xl text-white" />
            </div>
            <p className="text-white font-black text-lg">24/7 Support</p>
            <p className="text-green-100 text-xs mt-1 font-semibold">Always Available</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
