import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { gameAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getCommissionRate } from '../utils/config';

const GameLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entryAmount, setEntryAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [openBattles, setOpenBattles] = useState([]);
  const [runningBattles, setRunningBattles] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);

  useEffect(() => {
    fetchBattles();
    fetchCommission();
    const interval = setInterval(fetchBattles, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCommission = async () => {
    const rate = await getCommissionRate();
    setCommissionRate(rate);
  };

  const fetchBattles = async () => {
    try {
      const response = await gameAPI.getAvailableGames();
      const games = response.data.games || [];
      setOpenBattles(games.filter(g => g.status === 'waiting'));
      setRunningBattles(games.filter(g => g.status === 'in_progress'));
    } catch (error) {
      console.error('Failed to fetch battles:', error);
    }
  };

  const handleCreateBattle = async () => {
    if (!entryAmount || parseFloat(entryAmount) < 10) {
      toast.error('Minimum entry amount is ₹10');
      return;
    }

    const amount = parseFloat(entryAmount);
    const totalBalance = (user?.depositCash || 0) + (user?.winningCash || 0) + (user?.bonusCash || 0);

    if (totalBalance < amount) {
      toast.error(`Insufficient balance! You have ₹${totalBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.createGame('classic', amount, 2);
      const roomCode = response.data.game.roomCode;
      toast.success('Battle created successfully!');
      setEntryAmount('');
      
      // Navigate to the game immediately after creating
      navigate(`/game/${roomCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create battle');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async (roomCode) => {
    try {
      await gameAPI.joinGame(roomCode);
      toast.success('Joined battle successfully!');
      navigate(`/game/${roomCode}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join battle';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border-2 border-blue-500 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="text-3xl">📜</span>
                Game Rules
              </h2>
              <button
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                  🎮 How to Play
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Create or join a battle with your desired entry amount</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Wait for 2 players to join the battle</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Roll the dice and move your tokens strategically</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>First player to get all 4 tokens home wins!</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-green-400 font-bold text-lg mb-2 flex items-center gap-2">
                  💰 Winning & Prizes
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    <span>Winner takes the entire prize pool (minus {commissionRate}% commission)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    <span>Prize = Entry Fee × 2 players × {((100 - commissionRate) / 100).toFixed(2)}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    <span>Instant withdrawal to your wallet</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="text-yellow-400 font-bold text-lg mb-2 flex items-center gap-2">
                  ⚠️ Important Rules
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Minimum entry amount is ₹10</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>You must have sufficient balance to join</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>No refunds once the game starts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Fair play is mandatory - cheating leads to ban</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-bold text-lg mb-2 flex items-center gap-2">
                  🎁 Referral Bonus
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Earn 3% commission on every friend's game</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Share your referral code and start earning</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
            >
              Got It!
            </button>
          </motion.div>
        </div>
      )}
      {/* Info Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl border-2 border-green-400"
      >
        <p className="text-white text-sm font-semibold text-center">
          ⚡ {commissionRate}% Commission • 3% Referral • 24/7 Withdrawal • WhatsApp Support 📞
        </p>
      </motion.div>

      {/* Balance Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 mb-6 shadow-xl border-2 border-purple-400"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-semibold mb-1">Your Balance</p>
            <p className="text-white text-2xl font-black">
              ₹{((user?.depositCash || 0) + (user?.winningCash || 0) + (user?.bonusCash || 0)).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-white text-purple-600 px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg text-sm"
          >
            Add Cash
          </button>
        </div>
      </motion.div>

      {/* Create a Battle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 mb-6 shadow-2xl border-2 border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-3xl">⚔️</span>
            Create Battle
          </h2>
          <button 
            onClick={() => setShowRules(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-blue-700 transition-all shadow-lg"
          >
            Rules
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="number"
            value={entryAmount}
            onChange={(e) => setEntryAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gray-700 border-2 border-gray-600 pl-4 pr-20 sm:pr-24 py-3 rounded-xl text-white text-base outline-none focus:border-orange-500 transition-all placeholder-gray-400"
          />
          <button
            onClick={handleCreateBattle}
            disabled={loading}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg font-bold text-sm sm:text-base hover:scale-105 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? '...' : 'Create'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => setEntryAmount(amount.toString())}
              className="bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-all border border-gray-600"
            >
              ₹{amount}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Open Battles */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 rounded-t-2xl flex items-center gap-3 shadow-xl">
          <span className="text-3xl">🎯</span>
          <h3 className="text-xl font-black text-white">Open Battles</h3>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
            {openBattles.length}
          </span>
        </div>

        <div className="space-y-3 mt-3">
          {openBattles.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl text-center border border-gray-700">
              <p className="text-gray-400 text-lg">No open battles available</p>
              <p className="text-gray-500 text-sm mt-2">Create one to start playing!</p>
            </div>
          ) : (
            openBattles.map((battle, index) => {
              // Check if current user has already joined this battle
              const hasJoined = battle.players?.some(p => p.user === user?.id);
              
              return (
              <motion.div
                key={battle.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 shadow-xl border-2 border-green-500/30 hover:border-green-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {battle.roomCode.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 font-bold text-sm mb-1">Challenge</p>
                      <p className="text-white font-black text-lg truncate">{battle.roomCode}</p>
                      <p className="text-gray-400 text-xs">{battle.currentPlayers}/{battle.maxPlayers} Players</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-1 rounded-xl font-black text-lg">
                      ₹{battle.entryFee}
                    </span>
                    {hasJoined ? (
                      <button
                        onClick={() => navigate(`/game/${battle.roomCode}`)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
                      >
                        Joined ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinBattle(battle.roomCode)}
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )})
          )}
        </div>
      </motion.div>

      {/* Running Battles */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-t-2xl flex items-center gap-3 shadow-xl">
          <span className="text-3xl">🔥</span>
          <h3 className="text-xl font-black text-white">Running Battles</h3>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
            {runningBattles.length}
          </span>
        </div>

        <div className="space-y-3 mt-3">
          {runningBattles.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl text-center border border-gray-700">
              <p className="text-gray-400 text-lg">No running battles</p>
              <p className="text-gray-500 text-sm mt-2">Games will appear here once started</p>
            </div>
          ) : (
            runningBattles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 shadow-xl border-2 border-orange-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-bold">Playing For</p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-black">{battle.roomCode.substring(0, 3)}</span>
                    <span className="text-gray-500">&</span>
                    <span className="text-pink-400 font-black">{battle.roomCode.substring(3)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Entry Fee</p>
                    <p className="text-green-400 font-black text-2xl">₹{battle.entryFee}</p>
                  </div>

                  <div className="text-4xl">⚔️</div>

                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Prize</p>
                    <p className="text-yellow-400 font-black text-2xl">₹{battle.prizePool}</p>
                  </div>
                </div>

                <div className="mt-4 bg-orange-500/20 border border-orange-500 rounded-xl p-2 text-center">
                  <p className="text-orange-400 font-bold text-sm">🔴 LIVE</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GameLobby;
