import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaWallet, FaGift, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const Header = () => {
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-black via-gray-900 to-gray-900/95 backdrop-blur-xl z-50 w-full max-w-[480px] mx-auto shadow-2xl border-b-2 border-purple-500/30">
        <div className="flex items-center justify-between px-3 sm:px-4 py-4 sm:py-5">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-xl sm:text-2xl hover:scale-110 transition-transform bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
          >
            <FaBars />
          </button>

          <Link to="/" className="flex items-center gap-2 flex-1 justify-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl">🎲</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-base sm:text-lg leading-none">A2Z LUDO</span>
              <span className="text-yellow-400 font-bold text-[10px] sm:text-xs leading-none">Turn Fun Into Funds</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/wallet"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg"
            >
              <FaWallet className="text-white text-sm sm:text-base" />
              <span className="text-white font-black text-xs sm:text-sm">
                {user?.depositCash || 0}
              </span>
            </Link>
            
            <Link 
              to="/wallet"
              className="bg-gradient-to-r from-pink-500 to-purple-500 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg"
            >
              <FaGift className="text-white text-sm sm:text-base" />
              <span className="text-white font-black text-xs sm:text-sm">
                {user?.winningCash?.toFixed(0) || '0'}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Side Menu - Rendered outside header */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 sm:w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-black z-[110] shadow-2xl border-r-2 border-purple-500"
              style={{ maxWidth: '85vw' }}
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl">Menu</h2>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="text-white text-2xl hover:scale-110 transition-transform bg-red-500 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-xl">
                  <img 
                    src={user?.avatar || 'https://via.placeholder.com/50'} 
                    alt="Avatar" 
                    className="w-14 h-14 rounded-full border-2 border-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">
                      {user?.username || user?.phoneNumber}
                    </p>
                    <p className="text-white/80 text-sm truncate">ID: {user?.referralCode}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <Link 
                    to="/profile" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    👤 My Profile
                  </Link>
                  <Link 
                    to="/game-lobby" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    🎮 Play
                  </Link>
                  <Link 
                    to="/wallet" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    💳 My Wallet
                  </Link>
                  <Link 
                    to="/refer" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    👥 Refer and Earn
                  </Link>
                  <Link 
                    to="/transactions" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    🕐 History
                  </Link>
                  <Link 
                    to="/support" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                  >
                    💬 Support
                  </Link>
                  
                  {/* All Policy Dropdown */}
                  <div>
                    <button
                      onClick={() => setPolicyOpen(!policyOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 rounded-xl font-semibold transition-all"
                    >
                      <span>📋 All Policy</span>
                      {policyOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    
                    <AnimatePresence>
                      {policyOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 space-y-1 mt-1">
                            <Link 
                              to="/privacy-policy" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • Privacy Policy
                            </Link>
                            <Link 
                              to="/terms-conditions" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • Terms & Condition
                            </Link>
                            <Link 
                              to="/tds-policy" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • TDS Policy
                            </Link>
                            <Link 
                              to="/responsible-gaming" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • Responsible Gaming
                            </Link>
                            <Link 
                              to="/about" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • About
                            </Link>
                            <Link 
                              to="/contact" 
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                            >
                              • Contact
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
