import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: signup details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(searchParams.get('blocked') === 'true');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phoneNumber);
      toast.success(response.data.message);
      setStep(2);
      
      if (response.data.otp) {
        toast.success(`Your OTP is: ${response.data.otp}`, { duration: 10000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const deviceInfo = {
        deviceType: 'mobile',
        browser: navigator.userAgent,
        os: navigator.platform
      };

      const response = await authAPI.verifyOTP(phoneNumber, otp, referralCode, deviceInfo);
      
      if (response.data.isNewUser) {
        setIsNewUser(true);
        setStep(3);
        setLoading(false);
      } else {
        setAuth(response.data.user, response.data.token);
        toast.success(response.data.message);
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP';
      
      // Check if user is blocked
      if (error.response?.status === 403 || errorMessage.includes('blocked')) {
        setShowBlockedModal(true);
      } else {
        toast.error(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      // Update profile with username and email
      const response = await authAPI.verifyOTP(phoneNumber, otp, referralCode, {
        deviceType: 'mobile',
        browser: navigator.userAgent,
        os: navigator.platform
      });
      
      setAuth(response.data.user, response.data.token);
      
      // Update profile
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${response.data.token}`
        },
        body: JSON.stringify({ username, email })
      });
      
      toast.success('Welcome to A2Z Ludo! 🎉');
      toast.success('You received ₹50 bonus!', { duration: 5000 });
      navigate('/');
    } catch (error) {
      toast.error('Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative mx-auto mb-6 inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🎲</span>
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">
            A2Z LUDO
          </h1>
          <p className="text-gray-400 text-lg">
            Turn Fun Into Funds
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700"
        >
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
              <p className="text-gray-400 mb-6">Login or create a new account</p>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium text-sm">
                  Mobile Number
                </label>
                <div className="flex items-center bg-gray-700/50 rounded-xl overflow-hidden border border-gray-600 focus-within:border-orange-500 transition-colors">
                  <span className="px-4 text-gray-300 font-semibold">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 bg-transparent px-4 py-4 text-white outline-none placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {searchParams.get('ref') && (
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-medium text-sm">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="w-full bg-gray-700/50 border border-gray-600 px-4 py-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Login / Sign Up'}
              </button>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                New users will be asked to create a profile after OTP verification
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-gray-400 mb-6">
                Enter the code sent to +91 {phoneNumber}
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-gray-700/50 border border-gray-600 px-4 py-4 rounded-xl text-white text-center text-2xl tracking-widest outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 mb-4"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Change Number
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteSignup}>
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-gray-400 mb-6">Just a few more details to get started</p>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium text-sm">
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-gray-700/50 border border-gray-600 px-4 py-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium text-sm">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-700/50 border border-gray-600 px-4 py-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
              </button>
            </form>
          )}
        </motion.div>

        {/* Welcome Bonus Banner */}
        {step === 1 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white text-center shadow-xl"
          >
            <p className="font-bold">🎁 Get ₹50 Welcome Bonus on Sign Up!</p>
          </motion.div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>

      {/* Blocked Account Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-red-900 to-red-800 rounded-3xl p-6 w-full max-w-md border-2 border-red-500 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚫</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Account Blocked</h3>
              <p className="text-red-100 mb-6">
                Your account has been blocked by the administrator. 
                Please contact support for assistance.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@a2zludo.com"
                  className="block w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <button
                  onClick={() => {
                    setShowBlockedModal(false);
                    setStep(1);
                    setPhoneNumber('');
                    setOtp('');
                  }}
                  className="w-full bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};


export default Login;
