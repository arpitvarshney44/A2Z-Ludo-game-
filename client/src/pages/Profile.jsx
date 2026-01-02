import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaSignOutAlt, FaPhone, FaEnvelope, FaCheckCircle, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import axios from 'axios';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [referCode, setReferCode] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSubmitReferCode = async () => {
    if (!referCode.trim()) {
      toast.error('Please enter a refer code');
      return;
    }

    if (user?.referredBy) {
      toast.error('You have already applied a referral code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/user/apply-referral',
        { referralCode: referCode },
        {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage')).state.token}`
          }
        }
      );

      updateUser({ 
        referredBy: referCode.toUpperCase(),
        bonusCash: response.data.user.bonusCash
      });
      toast.success(response.data.message);
      setReferCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply referral code');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!editedUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (editedUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;
      
      const response = await axios.put(
        '/user/profile',
        { username: editedUsername },
        {
          baseURL: import.meta.env.VITE_API_URL,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      updateUser({ username: editedUsername });
      toast.success('Username updated successfully!');
      setIsEditingUsername(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update username');
      setEditedUsername(user?.username || '');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!editedEmail.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (editedEmail === user?.email) {
      setIsEditingEmail(false);
      return;
    }

    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;
      
      const response = await axios.put(
        '/user/profile',
        { email: editedEmail },
        {
          baseURL: import.meta.env.VITE_API_URL,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      updateUser({ email: editedEmail });
      toast.success('Email updated successfully!');
      setIsEditingEmail(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update email');
      setEditedEmail(user?.email || '');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(
        '/user/avatar',
        formData,
        {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      updateUser({ avatar: response.data.avatar });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f5d0] p-4 pb-24">
      {/* Profile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 mb-6 text-center shadow-lg"
      >
        <div className="relative inline-block mb-3">
          <img
            src={user?.avatar || 'https://via.placeholder.com/100'}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover mx-auto"
          />
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
          >
            {uploadingAvatar ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <FaCamera className="text-sm" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-red-500 text-2xl">💎</span>
          {isEditingUsername ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="bg-white/20 border-2 border-white/40 rounded-lg px-3 py-1 text-white text-xl font-bold outline-none focus:border-blue-400"
                autoFocus
              />
              <button
                onClick={handleUpdateUsername}
                disabled={loading}
                className="text-green-400 text-xl hover:scale-110 transition-all"
              >
                <FaSave />
              </button>
              <button
                onClick={() => {
                  setIsEditingUsername(false);
                  setEditedUsername(user?.username || '');
                }}
                className="text-red-400 text-xl hover:scale-110 transition-all"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-white">
                {user?.username || 'User'}
              </h2>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="text-blue-400 text-xl hover:scale-110 transition-all"
              >
                <FaEdit />
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Complete Profile Section */}
      <div className="mb-6">
        <h3 className="text-gray-800 font-bold text-xl mb-4">Complete Profile</h3>
        
        {/* Mobile Number */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 mb-3 shadow-lg flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaPhone className="text-blue-400 text-2xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold">Mobile Number</p>
            <p className="text-gray-800 font-bold text-lg">{user?.phoneNumber}</p>
          </div>
        </motion.div>

        {/* Email Address */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 mb-3 shadow-lg flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaEnvelope className="text-white text-2xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold">Email Address</p>
            {isEditingEmail ? (
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="bg-gray-100 border-2 border-blue-300 rounded-lg px-3 py-1 text-gray-800 font-bold text-lg outline-none focus:border-blue-500 w-full"
                autoFocus
              />
            ) : (
              <p className="text-gray-800 font-bold text-lg">{user?.email || 'Not set'}</p>
            )}
          </div>
          {isEditingEmail ? (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateEmail}
                disabled={loading}
                className="text-green-500 text-2xl hover:scale-110 transition-all"
              >
                <FaSave />
              </button>
              <button
                onClick={() => {
                  setIsEditingEmail(false);
                  setEditedEmail(user?.email || '');
                }}
                className="text-red-500 text-2xl hover:scale-110 transition-all"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingEmail(true)}
              className="text-purple-500 text-2xl hover:scale-110 transition-all"
            >
              <FaEdit />
            </button>
          )}
        </motion.div>
      </div>

      {/* KYC Verification */}
      <Link to="/kyc">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 mb-6 text-center shadow-lg hover:scale-105 transition-transform"
        >
          <div className="text-5xl mb-3">🆔</div>
          <h3 className="text-white font-black text-2xl">KYC VERIFICATION</h3>
        </motion.div>
      </Link>

      {/* Referral Code Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h3 className="text-gray-800 font-bold text-xl mb-4">
          {user?.referredBy ? 'Applied Referral Code' : 'Use Refer Code'}
        </h3>
        {user?.referredBy ? (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-2xl px-4 py-4 flex items-center gap-3">
            <FaCheckCircle className="text-green-600 text-2xl flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Referral Code Applied</p>
              <p className="text-gray-800 font-bold text-xl">{user.referredBy}</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={referCode}
              onChange={(e) => setReferCode(e.target.value.toUpperCase())}
              placeholder="Enter Refer Code"
              className="flex-1 bg-white border-2 border-gray-300 rounded-2xl px-4 py-3 text-gray-800 font-semibold outline-none focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleSubmitReferCode}
              className="bg-green-100 border-2 border-green-300 w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 transition-all flex-shrink-0"
            >
              <FaCheckCircle className="text-green-600 text-2xl" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Other Details */}
      <div className="mb-6">
        <h3 className="text-gray-800 font-bold text-xl mb-4">Other Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Referral Earning */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎁</span>
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Referral Earning</h4>
            <p className="text-white font-black text-3xl">{user?.referralEarnings || 0}</p>
          </motion.div>

          {/* Battle Played */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-cyan-400 to-green-400 rounded-3xl p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚔️</span>
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Battle Played</h4>
            <p className="text-white font-black text-3xl">{user?.totalGamesPlayed || 0}</p>
          </motion.div>

          {/* Coin Won */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🪙</span>
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Coin Won</h4>
            <p className="text-white font-black text-3xl">{user?.totalCoinsWon || 0}</p>
          </motion.div>

          {/* Total Withdrawal */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Total Withdrawal</h4>
            <p className="text-white font-black text-3xl">{user?.totalWithdrawal || 0}</p>
          </motion.div>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleLogout}
        className="w-full bg-black text-white font-bold text-xl py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg"
      >
        Log Out
      </motion.button>
    </div>
  );
};

export default Profile;
