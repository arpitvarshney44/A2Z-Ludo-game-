import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhone, FaTicketAlt, FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supportAPI } from '../services/api';

const Support = () => {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const response = await supportAPI.getMyTickets();
      setMyTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await supportAPI.createTicket(newTicket.subject, newTicket.category, newTicket.message);
      toast.success('Ticket created successfully! 🎫');
      setNewTicket({ subject: '', category: 'general', message: '' });
      setShowCreateTicket(false);
      fetchMyTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await supportAPI.addMessage(selectedTicket._id, newMessage);
      toast.success('Message sent!');
      setNewMessage('');
      
      // Refresh ticket details
      const response = await supportAPI.getTicketById(selectedTicket._id);
      setSelectedTicket(response.data.ticket);
      fetchMyTickets();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: FaClock, label: 'Open' },
      closed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: FaCheckCircle, label: 'Closed' },
      resolved: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: FaCheckCircle, label: 'Resolved' }
    };
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <Icon /> {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-6 text-center relative overflow-hidden shadow-2xl border-4 border-blue-400"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-20" />
        <div className="relative">
          <div className="text-6xl mb-3">🎧</div>
          <h1 className="text-4xl font-black text-white mb-2">Support Center</h1>
          <p className="text-white/90 text-lg">
            We're here to help you 24/7
          </p>
        </div>
      </motion.div>

      {/* Create Ticket Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setShowCreateTicket(true)}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 mb-6 hover:scale-105 transition-all shadow-xl border-2 border-green-400"
      >
        <FaPlus className="text-2xl" />
        Create Support Ticket
      </motion.button>

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-white font-black text-2xl mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-yellow-400" />
            My Tickets ({myTickets.length})
          </h2>
          <div className="space-y-3">
            {myTickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer shadow-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{ticket.subject}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{ticket.message}</p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 capitalize">{ticket.category}</span>
                  <span className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                {ticket.replies && ticket.replies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-blue-400 text-sm">
                      💬 {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contact Options */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-white font-black text-2xl mb-4">Quick Contact</h2>

        {/* WhatsApp */}
        <a
          href="https://wa.me/918441952800"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-5 mb-3 border-2 border-gray-700 hover:border-green-500 transition-all shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaWhatsapp className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-1">WhatsApp Support</h3>
              <p className="text-gray-400">Chat with us instantly</p>
            </div>
            <span className="text-white text-2xl">→</span>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:support@a2zludo.com"
          className="block bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-5 mb-3 border-2 border-gray-700 hover:border-blue-500 transition-all shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaEnvelope className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-1">Email Support</h3>
              <p className="text-gray-400">support@a2zludo.com</p>
            </div>
            <span className="text-white text-2xl">→</span>
          </div>
        </a>

        {/* Phone */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-gray-700 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaPhone className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-1">Phone Support</h3>
              <a href="tel:918441952800" className="text-blue-400 text-lg font-semibold">
                +91 8441952800
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowCreateTicket(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaTicketAlt className="text-blue-400" />
                Create Support Ticket
              </h2>
              <button
                onClick={() => setShowCreateTicket(false)}
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Subject *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Category *</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General Query</option>
                  <option value="payment">Payment Issue</option>
                  <option value="game">Game Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Message *</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 min-h-[150px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTicket(false)}
                  className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h3>
                  <p className="text-gray-400 text-sm capitalize">{selectedTicket.category}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-white text-3xl ml-4"
                >
                  ×
                </button>
              </div>
              {getStatusBadge(selectedTicket.status)}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Original Message */}
              <div className="bg-gray-700/50 rounded-2xl p-4">
                <p className="text-white mb-2">{selectedTicket.message}</p>
                <p className="text-gray-500 text-xs">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>

              {/* Replies */}
              {selectedTicket.replies?.map((reply, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 ${
                    reply.isAdmin
                      ? 'bg-blue-600/20 border-2 border-blue-500/30 ml-4'
                      : 'bg-gray-700/50 mr-4'
                  }`}
                >
                  <p className="text-white mb-2">{reply.message}</p>
                  <p className="text-gray-500 text-xs">
                    {reply.isAdmin ? '👨‍💼 Admin' : '👤 You'} • {new Date(reply.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {selectedTicket.status === 'open' && (
              <div className="sticky bottom-0 bg-gray-800 p-6 border-t border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl outline-none border-2 border-gray-600 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-bold"
                  >
                    <FaPaperPlane /> Send
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Support;
