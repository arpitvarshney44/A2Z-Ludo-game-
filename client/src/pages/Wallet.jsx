import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaArrowDown, FaHistory, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Wallet = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await authAPI.getMe();
        updateUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };
    fetchBalance();
  }, [updateUser]);

  const refreshBalance = async () => {
    setRefreshing(true);
    try {
      const response = await authAPI.getMe();
      updateUser(response.data.user);
      toast.success('Balance refreshed!');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">💰</span>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            My Wallet
          </h1>
        </div>
        <button
          onClick={refreshBalance}
          disabled={refreshing}
          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
          title="Refresh Balance"
        >
          <FaSync className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Deposit Cash Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-[2rem] p-6 mb-4 border-4 border-cyan-300 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full filter blur-3xl opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/50">
              <span className="text-4xl">💳</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white/90 font-bold text-lg mb-1">Deposit Cash</h2>
              <p className="text-5xl font-black text-white">₹{user?.depositCash || 0}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/deposit')}
            className="w-full bg-white text-blue-600 font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
          >
            <FaPlus className="text-xl" />
            Add Cash
          </button>
        </div>
      </motion.div>

      {/* Winning Cash Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[2rem] p-6 mb-4 border-4 border-yellow-300 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full filter blur-3xl opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/50">
              <span className="text-4xl">🏆</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white/90 font-bold text-lg mb-1">Winning Cash</h2>
              <p className="text-5xl font-black text-white">₹{user?.winningCash?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/withdrawal')}
            className="w-full bg-white text-orange-600 font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
          >
            <FaArrowDown className="text-xl" />
            Withdraw
          </button>
        </div>
      </motion.div>

      {/* Bonus Cash Card */}
      {user?.bonusCash > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-[2rem] p-6 mb-4 border-4 border-pink-300 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full filter blur-3xl opacity-20" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/50">
              <span className="text-4xl">🎁</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white/90 font-bold text-lg mb-1">Bonus Cash</h2>
              <p className="text-5xl font-black text-white">₹{user?.bonusCash || 0}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction History Link */}
      <Link
        to="/transactions"
        className="block bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white font-bold text-lg flex items-center justify-between hover:scale-105 transition-all shadow-xl border-2 border-purple-400 mb-3"
      >
        <span className="flex items-center gap-3">
          <FaHistory className="text-2xl" />
          Transaction History
        </span>
        <span className="text-2xl">→</span>
      </Link>

      {/* Payment History Link */}
      <Link
        to="/payment-history"
        className="block bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-5 text-white font-bold text-lg flex items-center justify-between hover:scale-105 transition-all shadow-xl border-2 border-orange-400"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          Payment History
        </span>
        <span className="text-2xl">→</span>
      </Link>
    </div>
  );
};

export default Wallet;
