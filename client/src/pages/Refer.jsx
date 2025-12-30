import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaWhatsapp, FaTrophy, FaMoneyBillWave, FaUsers, FaGift, FaShare, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { referralAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getReferralBonus } from '../utils/config';

const Refer = () => {
  const { user } = useAuthStore();
  const [referralInfo, setReferralInfo] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [referralBonus, setReferralBonus] = useState(50);
  const [activeTab, setActiveTab] = useState('all'); // all, recent, active

  useEffect(() => {
    fetchReferralInfo();
    fetchReferredUsers();
    fetchReferralBonus();
  }, []);

  const fetchReferralBonus = async () => {
    const bonus = await getReferralBonus();
    setReferralBonus(bonus);
  };

  const fetchReferralInfo = async () => {
    try {
      const response = await referralAPI.getInfo();
      setReferralInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch referral info:', error);
    }
  };

  const fetchReferredUsers = async () => {
    try {
      const response = await referralAPI.getReferredUsers();
      setReferredUsers(response.data.referredUsers || []);
    } catch (error) {
      console.error('Failed to fetch referred users:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied! 📋', { icon: '✅' });
  };

  const handleCopyLink = () => {
    const link = referralInfo?.referralLink || `${window.location.origin}?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied! 🔗', { icon: '✅' });
  };

  const handleShareWhatsApp = () => {
    const message = `🎮 Join A2Z Ludo and get ₹${referralBonus} bonus!\n\n💰 Play Ludo & Win Real Money\n🎁 Use my referral code: ${user?.referralCode}\n\n👉 ${referralInfo?.referralLink || window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join A2Z Ludo',
          text: `Join A2Z Ludo and get ₹${referralBonus} bonus! Use my referral code: ${user?.referralCode}`,
          url: referralInfo?.referralLink || window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  // Filter referrals based on active tab
  const getFilteredReferrals = () => {
    if (activeTab === 'recent') {
      return referredUsers.slice(0, 5);
    } else if (activeTab === 'active') {
      return referredUsers.filter(u => u.totalGamesPlayed > 0);
    }
    return referredUsers;
  };

  const filteredReferrals = getFilteredReferrals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-8 mb-6 text-center relative overflow-hidden shadow-2xl border-4 border-orange-300"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        <div className="relative">
          <div className="text-7xl mb-4 animate-bounce">🎁</div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">Refer & Earn</h1>
          <p className="text-white text-xl font-semibold mb-2">
            Invite friends and earn ₹{referralBonus} per referral!
          </p>
          <p className="text-white/80 text-sm">
            Plus, earn commission on every game they play
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-center shadow-2xl border-2 border-blue-400"
        >
          <FaUsers className="text-5xl text-white mx-auto mb-3" />
          <p className="text-white font-black text-4xl mb-1">{referredUsers.length}</p>
          <p className="text-white/90 font-semibold">Total Referrals</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-center shadow-2xl border-2 border-green-400"
        >
          <FaMoneyBillWave className="text-5xl text-white mx-auto mb-3" />
          <p className="text-white font-black text-4xl mb-1">₹{user?.referralEarnings || 0}</p>
          <p className="text-white/90 font-semibold">Total Earned</p>
        </motion.div>
      </div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-6 mb-4 border-2 border-gray-700 shadow-2xl"
      >
        <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <span className="text-3xl">🎫</span>
          Your Referral Code
        </h2>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1 mb-4">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex flex-col gap-3">
              <span className="text-white text-3xl font-black tracking-wider text-center">{user?.referralCode || 'LOADING'}</span>
              <button
                onClick={handleCopyCode}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
              >
                <FaCopy /> Copy Code
              </button>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg border-2 border-green-400"
          >
            <FaWhatsapp className="text-2xl" />
            WhatsApp
          </button>
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg border-2 border-blue-400"
          >
            <FaShare className="text-xl" />
            Share
          </button>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500 rounded-3xl p-6 mb-6"
      >
        <h2 className="text-white font-black text-2xl mb-4 flex items-center gap-2">
          <FaGift className="text-yellow-400" />
          How It Works
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-black text-white text-xl shadow-lg">
              1
            </div>
            <div>
              <p className="text-white font-bold text-lg">Share Your Code</p>
              <p className="text-gray-300 text-sm">Send your referral code to friends via WhatsApp or social media</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-black text-white text-xl shadow-lg">
              2
            </div>
            <div>
              <p className="text-white font-bold text-lg">Friend Signs Up</p>
              <p className="text-gray-300 text-sm">They register using your code and get ₹{referralBonus} bonus</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-black text-white text-xl shadow-lg">
              3
            </div>
            <div>
              <p className="text-white font-bold text-lg">You Earn Money</p>
              <p className="text-gray-300 text-sm">Get ₹{referralBonus} instantly + earn commission on their games</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referrals List */}
      {referredUsers.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-2xl flex items-center gap-2">
              <span className="text-3xl">👥</span>
              Your Referrals
            </h2>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {referredUsers.length} Total
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({referredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === 'recent'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <FaClock className="inline mr-1" />
              Recent (5)
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <FaCheckCircle className="inline mr-1" />
              Active ({referredUsers.filter(u => u.totalGamesPlayed > 0).length})
            </button>
          </div>

          {/* Referrals List */}
          <div className="space-y-3">
            {filteredReferrals.length === 0 ? (
              <div className="bg-gray-800/50 rounded-2xl p-8 text-center border-2 border-gray-700">
                <p className="text-gray-400 text-lg">No referrals in this category yet</p>
              </div>
            ) : (
              filteredReferrals.map((refUser, index) => (
                <motion.div
                  key={refUser._id || index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-700 hover:border-purple-500/50 transition-all shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={refUser.avatar || 'https://via.placeholder.com/60'}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full border-4 border-purple-500 shadow-lg"
                      />
                      {refUser.totalGamesPlayed > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-900">
                          <FaCheckCircle className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-lg truncate">{refUser.username || 'User'}</p>
                      <p className="text-gray-400 text-sm">{refUser.phoneNumber}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-purple-600/30 text-purple-400 px-2 py-1 rounded-full">
                          {refUser.totalGamesPlayed || 0} games
                        </span>
                        {refUser.totalGamesPlayed > 0 && (
                          <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-black text-2xl">+₹{referralBonus}</p>
                      <p className="text-gray-400 text-xs">Earned</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {referredUsers.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-3xl p-12 text-center border-2 border-gray-700"
        >
          <div className="text-7xl mb-4">👥</div>
          <h3 className="text-white font-bold text-2xl mb-2">No Referrals Yet</h3>
          <p className="text-gray-400 mb-6">
            Start sharing your referral code to earn money!
          </p>
          <button
            onClick={handleShareWhatsApp}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
          >
            <FaWhatsapp className="text-2xl" />
            Share Now
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Refer;
