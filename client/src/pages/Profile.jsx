import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaSignOutAlt, FaCheckCircle, FaClock, FaCamera, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { userAPI, authAPI } from '../services/api';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('avatar', compressedFile);

      const response = await userAPI.uploadAvatar(formData);
      
      // Update user in store
      updateUser({ ...user, avatar: response.data.avatar });
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            0.85 // Quality 85%
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('File read failed'));
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!editUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await userAPI.updateProfile({ 
        username: editUsername.trim(), 
        email: editEmail.trim() 
      });
      
      const response = await authAPI.getMe();
      updateUser(response.data.user);
      
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusBadge = () => {
    if (user?.isKYCVerified) {
      return (
        <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-500">
          <FaCheckCircle className="text-green-400" />
          <span className="text-green-400 font-bold">Verified</span>
        </div>
      );
    } else if (user?.kycStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-500">
          <FaClock className="text-yellow-400" />
          <span className="text-yellow-400 font-bold">Pending</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl border border-red-500">
          <span className="text-red-400 font-bold">Not Verified</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-[2rem] p-6 mb-6 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        
        <div className="relative">
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-4">
              <img
                src={user?.avatar || 'https://via.placeholder.com/120'}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <button 
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white disabled:opacity-70"
              >
                {uploadingAvatar ? (
                  <FaSpinner className="text-white animate-spin" />
                ) : (
                  <FaCamera className="text-white" />
                )}
              </button>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 text-center">
              {user?.username || 'User'}
            </h2>
            <p className="text-white/90 text-lg mb-1">{user?.phoneNumber}</p>
            {user?.email && (
              <p className="text-white/80 text-sm mb-3">{user?.email}</p>
            )}
            
            <button
              onClick={() => {
                setEditUsername(user?.username || '');
                setEditEmail(user?.email || '');
                setShowEditModal(true);
              }}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-semibold hover:bg-white/30 transition-all flex items-center gap-2 mx-auto"
            >
              <FaEdit />
              Edit Profile
            </button>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-white/80 text-sm mb-1">Referral Code</p>
                <p className="text-white font-black text-2xl truncate">{user?.referralCode}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user?.referralCode || '');
                  toast.success('Referral code copied!');
                }}
                className="bg-white text-purple-600 px-5 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KYC Verification */}
      <Link to="/kyc">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-4 flex items-center justify-between shadow-xl border-2 border-blue-400 hover:scale-105 transition-transform"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🆔</span>
              <h3 className="text-white font-black text-xl">KYC VERIFICATION</h3>
            </div>
            {getKYCStatusBadge()}
          </div>
          <span className="text-white text-3xl">→</span>
        </motion.div>
      </Link>

      {/* Use Refer Code */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 mb-4 border-2 border-gray-700 shadow-xl"
      >
        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          Use Refer Code
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter refer Code"
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl outline-none border-2 border-gray-600 focus:border-yellow-400 transition-all text-base"
          />
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center flex-shrink-0">
            ✓
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <h3 className="text-white font-black text-2xl mb-4 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Your Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-center shadow-xl border-2 border-orange-400">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-white font-black text-3xl mb-1">₹{user?.referralEarnings || 0}</p>
            <p className="text-white/90 text-sm font-semibold">Referral Earning</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-center shadow-xl border-2 border-cyan-400">
            <div className="text-4xl mb-2">⚔️</div>
            <p className="text-white font-black text-3xl mb-1">{user?.totalGamesPlayed || 0}</p>
            <p className="text-white/90 text-sm font-semibold">Games Played</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-center shadow-xl border-2 border-purple-400">
            <div className="text-4xl mb-2">🪙</div>
            <p className="text-white font-black text-3xl mb-1">₹{user?.totalCoinsWon || 0}</p>
            <p className="text-white/90 text-sm font-semibold">Coins Won</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-center shadow-xl border-2 border-pink-400">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-white font-black text-3xl mb-1">₹{user?.totalWithdrawal || 0}</p>
            <p className="text-white/90 text-sm font-semibold">Total Withdrawal</p>
          </div>
        </div>
      </motion.div>

      {/* Win Rate */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 mb-4 shadow-xl border-2 border-green-400"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm mb-1">Win Rate</p>
            <p className="text-white font-black text-4xl">
              {user?.totalGamesPlayed > 0 
                ? ((user?.totalGamesWon / user?.totalGamesPlayed) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div className="text-6xl">🏆</div>
        </div>
        <div className="mt-3 flex gap-4 text-white/90 text-sm">
          <span>✅ Won: {user?.totalGamesWon || 0}</span>
          <span>❌ Lost: {user?.totalGamesLost || 0}</span>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl border-2 border-red-500"
      >
        <FaSignOutAlt className="text-2xl" />
        Log Out
      </motion.button>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 w-full max-w-md border-2 border-purple-500 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-white">Edit Profile</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white text-2xl hover:scale-110 transition-transform bg-red-500 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-medium text-sm">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl outline-none border-2 border-gray-600 focus:border-purple-500 transition-all"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 font-medium text-sm">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl outline-none border-2 border-gray-600 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
