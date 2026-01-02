import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Wallet = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#e8f5d0] p-4 pb-24">
      {/* Balance Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800">Balance</h1>
      </div>

      {/* Deposit Cash Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden border-l-8 border-blue-400"
      >
        <div className="flex">
          {/* Left side - Illustration */}
          <div className="w-2/5 bg-gray-50 flex items-center justify-center p-6">
            <img 
              src="/deposit.png" 
              alt="Deposit" 
              className="w-full h-auto object-contain max-w-[150px]"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-2xl px-6 py-3 mb-4 inline-block">
              <h2 className="text-xl font-black text-gray-800">Deposit Cash</h2>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-2xl">₹</span>
              <span className="text-4xl font-black text-green-500">{user?.depositCash || 0}</span>
            </div>

            <button
              onClick={() => navigate('/deposit')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              + Add Cash
            </button>
          </div>
        </div>
      </motion.div>

      {/* Winning Cash Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden border-l-8 border-yellow-400"
      >
        <div className="flex">
          {/* Left side - Illustration */}
          <div className="w-2/5 bg-gray-50 flex items-center justify-center p-6">
            <img 
              src="/win-cash.png" 
              alt="Winning" 
              className="w-full h-auto object-contain max-w-[150px]"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-2xl px-6 py-3 mb-4 inline-block">
              <h2 className="text-xl font-black text-gray-800">Winning Cash</h2>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-2xl">₹</span>
              <span className="text-4xl font-black text-red-500">{user?.winningCash?.toFixed(0) || 0}</span>
            </div>

            <button
              onClick={() => navigate('/withdrawal')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">💳</span>
              Withdraw
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bonus Cash Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden border-l-8 border-purple-400"
      >
        <div className="flex">
          {/* Left side - Illustration */}
          <div className="w-2/5 bg-gray-50 flex items-center justify-center p-6">
            <img 
              src="/indian-rupee-money-bag.png" 
              alt="Bonus" 
              className="w-full h-auto object-contain max-w-[150px]"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-2xl px-6 py-3 mb-4 inline-block">
              <h2 className="text-xl font-black text-gray-800">Bonus Cash</h2>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-2xl">₹</span>
              <span className="text-4xl font-black text-purple-500">{user?.bonusCash?.toFixed(0) || 0}</span>
            </div>

            <p className="text-gray-600 text-sm font-semibold">
              💡 Use bonus cash to play games
            </p>
          </div>
        </div>
      </motion.div>

      {/* Transaction History Link */}
      <Link
        to="/transactions"
        className="block bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white font-bold text-lg flex items-center justify-between hover:scale-105 transition-all shadow-xl border-2 border-purple-400 mt-6 mb-3"
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
