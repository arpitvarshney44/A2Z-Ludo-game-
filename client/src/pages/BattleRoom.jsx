import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaUpload, FaTrophy, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { gameAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const BattleRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBattleDetails();
    const interval = setInterval(fetchBattleDetails, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const fetchBattleDetails = async () => {
    try {
      const response = await gameAPI.getGameDetails(roomCode);
      setBattle(response.data.game);
    } catch (error) {
      toast.error('Failed to load battle details');
      navigate('/game-lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied!', { icon: '📋' });
  };

  const handleFileChange = (e) => {
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

    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleUploadWinScreenshot = async () => {
    if (!screenshot) {
      toast.error('Please select a screenshot');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('roomCode', roomCode);

      await gameAPI.uploadWinScreenshot(formData);
      toast.success('Screenshot uploaded successfully!');
      setScreenshot(null);
      setScreenshotPreview('');
      fetchBattleDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelBattle = async () => {
    if (!window.confirm('Are you sure you want to cancel this battle? Your entry fee will be refunded.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await gameAPI.cancelGame(roomCode);
      toast.success(`Battle cancelled! ₹${response.data.refundedAmount} refunded to your wallet`);
      navigate('/game-lobby');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel battle');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8f5d0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-[#e8f5d0] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-800 text-xl font-bold">Battle not found</p>
          <button
            onClick={() => navigate('/game-lobby')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl font-bold"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isPlayer = battle.players?.some(p => p.user._id === user?.id);
  const currentPlayer = battle.players?.find(p => p.user._id === user?.id);
  const hasUploadedScreenshot = currentPlayer?.winScreenshot;
  const isCreator = battle.players?.[0]?.user._id === user?.id;
  const canCancel = isCreator && battle.currentPlayers === 1 && battle.status === 'waiting';

  return (
    <div className="min-h-screen bg-[#e8f5d0] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/game-lobby')}
          className="bg-white text-gray-800 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all shadow-lg"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-black text-gray-800">Battle Room</h1>
      </div>

      {/* Room Code Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 mb-6 shadow-xl border-2 border-purple-400"
      >
        <p className="text-white/80 text-sm font-semibold mb-2">Room Code</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-white text-4xl font-black tracking-wider">{roomCode}</p>
          <button
            onClick={handleCopyRoomCode}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
            title="Copy Room Code"
          >
            <FaCopy className="text-xl" />
          </button>
        </div>
        <p className="text-white/70 text-xs mt-3">
          💡 Share this code with your opponent to start the game
        </p>
      </motion.div>

      {/* Battle Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 mb-6 shadow-lg border-2 border-gray-200"
      >
        <h2 className="text-xl font-black text-gray-800 mb-4">Battle Details</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
            <p className="text-green-600 text-sm font-semibold mb-1">Entry Fee</p>
            <p className="text-green-700 text-2xl font-black">₹{battle.entryFee}</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
            <p className="text-yellow-600 text-sm font-semibold mb-1">Prize Pool</p>
            <p className="text-yellow-700 text-2xl font-black">₹{battle.prizePool}</p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
          <p className="text-blue-600 text-sm font-semibold mb-2">Players ({battle.players?.length || 0}/2)</p>
          <div className="space-y-2">
            {battle.players?.map((player, index) => (
              <div key={player.user._id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-bold">{player.user.username || player.user.phoneNumber}</p>
                  {player.winScreenshot && (
                    <p className="text-green-600 text-xs font-semibold">✓ Screenshot uploaded</p>
                  )}
                </div>
                {player.user._id === user?.id && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">You</span>
                )}
              </div>
            ))}
            {battle.players?.length < 2 && (
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold">
                  ?
                </div>
                <p className="text-gray-500 font-semibold">Waiting for opponent...</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 mb-6 shadow-lg border-2 border-gray-200"
      >
        <h2 className="text-xl font-black text-gray-800 mb-4">Game Status</h2>
        
        {battle.status === 'waiting' && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
            <p className="text-yellow-700 font-bold text-lg mb-2">⏳ Waiting for Players</p>
            <p className="text-yellow-600 text-sm">Battle will start when 2 players join</p>
          </div>
        )}

        {battle.status === 'in_progress' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
            <p className="text-blue-700 font-bold text-lg mb-2">🎮 Game in Progress</p>
            <p className="text-blue-600 text-sm">Play the game and upload your win screenshot below</p>
          </div>
        )}

        {battle.status === 'completed' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-lg mb-2">✅ Game Completed</p>
            {battle.winner && (
              <p className="text-green-600 text-sm">
                Winner: {battle.winner.username || battle.winner.phoneNumber}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Cancel Battle Button (Only for creator, only before second player joins) */}
      {canCancel && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-6 mb-6 shadow-lg border-2 border-red-200"
        >
          <h2 className="text-xl font-black text-gray-800 mb-4">Cancel Battle</h2>
          <p className="text-gray-600 text-sm mb-4">
            You can cancel this battle and get your entry fee refunded since no one has joined yet.
          </p>
          <button
            onClick={handleCancelBattle}
            disabled={cancelling}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Battle & Get Refund'}
          </button>
        </motion.div>
      )}

      {/* Upload Win Screenshot */}
      {isPlayer && battle.status === 'in_progress' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-200"
        >
          <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Upload Win Screenshot
          </h2>

          {hasUploadedScreenshot ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold mb-2">✅ Screenshot Uploaded</p>
              <p className="text-green-600 text-sm">Waiting for admin verification...</p>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="mb-4">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-xl border-2 border-gray-300 bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview('');
                    }}
                    className="w-full mt-3 bg-red-100 text-red-600 py-2 rounded-xl font-bold hover:bg-red-200 transition-all"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all mb-4"
                >
                  <FaUpload className="text-5xl text-gray-400" />
                  <p className="text-gray-600 font-bold">Tap to upload screenshot</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
                </button>
              )}

              <button
                onClick={handleUploadWinScreenshot}
                disabled={!screenshot || uploading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {uploading ? 'Uploading...' : 'Submit Win Screenshot'}
              </button>

              <p className="text-gray-600 text-xs mt-3 text-center">
                💡 Upload a clear screenshot showing you won the game
              </p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BattleRoom;
