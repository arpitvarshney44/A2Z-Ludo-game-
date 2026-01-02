import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { referralAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getReferralBonus } from '../utils/config';

const Refer = () => {
  const { user } = useAuthStore();
  const [referralInfo, setReferralInfo] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [referralBonus, setReferralBonus] = useState(50);

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
    toast.success('Referral code copied!');
  };

  const handleShareWhatsApp = () => {
    const message = `🎮 Join A2Z Ludo and get ₹${referralBonus} bonus!\n\n💰 Play Ludo & Win Real Money\n🎁 Use my referral code: ${user?.referralCode}\n\n👉 ${referralInfo?.referralLink || window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#e8f5d0] p-4 pb-24">
      {/* Header Card with Illustration */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-cyan-300 to-blue-300 rounded-3xl p-8 mb-6 text-center shadow-lg"
      >
        <div className="mb-4">
          <img 
            src="/refer.png" 
            alt="Refer Friends" 
            className="w-32 h-32 mx-auto object-contain"
          />
        </div>
        <h1 className="text-4xl font-black text-gray-600 mb-3">Refer</h1>
        <p className="text-gray-800 text-lg font-semibold">
          You can earn more more real money<br />doing refer to your friends
        </p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 mb-4 shadow-lg"
      >
        <h2 className="text-gray-800 font-bold text-xl mb-4">Referral Code</h2>
        <div className="flex gap-2 items-center bg-gray-100 border-2 border-gray-300 rounded-2xl px-4 py-4">
          <span className="flex-1 text-gray-800 font-bold text-2xl">
            {user?.referralCode || ''}
          </span>
          <button
            onClick={handleCopyCode}
            className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all flex-shrink-0 text-sm"
          >
            Copy
          </button>
        </div>
      </motion.div>

      {/* WhatsApp Share Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleShareWhatsApp}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xl py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg mb-6"
        >
          <FaWhatsapp className="text-3xl" />
          Whatsapp
        </button>
      </motion.div>

      {/* Your Referral Earnings */}
      <div className="mb-4">
        <h2 className="text-gray-800 font-bold text-xl mb-4">Your Referral Earnings</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Referred Players Card */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-6 shadow-lg relative overflow-hidden"
        >
          <h3 className="text-gray-800 font-bold text-lg mb-2">Referred Players</h3>
          <p className="text-5xl font-black text-gray-800 mb-4">{referredUsers.length}</p>
          <div className="absolute bottom-2 right-2">
            <img 
              src="/trophy.png" 
              alt="Trophy" 
              className="w-20 h-20 object-contain opacity-80"
            />
          </div>
        </motion.div>

        {/* Referral Earning Card */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-6 shadow-lg relative overflow-hidden"
        >
          <h3 className="text-gray-800 font-bold text-lg mb-2">Referral Earning</h3>
          <p className="text-5xl font-black text-gray-800 mb-4">₹{user?.referralEarnings || 0}</p>
          <div className="absolute bottom-2 right-2">
            <img 
              src="/indian-rupee-money-bag.png" 
              alt="Money Bag" 
              className="w-20 h-20 object-contain opacity-80"
            />
          </div>
        </motion.div>
      </div>

      {/* Referred Users List */}
      {referredUsers.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-gray-800 font-bold text-xl mb-4">Your Referrals</h2>
          <div className="space-y-3">
            {referredUsers.map((referredUser, index) => (
              <motion.div
                key={referredUser.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (index * 0.05) }}
                className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4"
              >
                <img
                  src={referredUser.avatar || 'https://via.placeholder.com/50'}
                  alt={referredUser.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-gray-800 font-bold text-lg">
                    {referredUser.username || 'User'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {referredUser.phoneNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-xs">Games Played</p>
                  <p className="text-gray-800 font-bold text-lg">
                    {referredUser.totalGamesPlayed || 0}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {referredUsers.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 text-center shadow-lg"
        >
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-gray-800 font-bold text-xl mb-2">No Referrals Yet</h3>
          <p className="text-gray-600">
            Share your referral code with friends to start earning!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Refer;
