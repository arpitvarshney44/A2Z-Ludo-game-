import { useState, useEffect } from 'react';
import { FaGamepad, FaEye, FaSearch, FaFilter, FaTrophy, FaUsers, FaClock, FaImage, FaCheckCircle } from 'react-icons/fa';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [declaring, setDeclaring] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [filter]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGames(1, 50, filter !== 'all' ? filter : '');
      setGames(response.data.games || []);
    } catch (error) {
      toast.error('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinner = async (winnerId) => {
    if (!window.confirm('Are you sure you want to declare this player as the winner?')) {
      return;
    }

    setDeclaring(true);
    try {
      const response = await adminAPI.declareWinner(selectedGame.roomCode, winnerId);
      toast.success('Winner declared successfully!');
      
      // Update the selected game with the response
      setSelectedGame(response.data.game);
      
      // Refresh the games list
      fetchGames();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to declare winner');
    } finally {
      setDeclaring(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✓',
      in_progress: '▶',
      waiting: '⏳',
      cancelled: '✕'
    };
    return icons[status] || '•';
  };

  const filteredGames = games.filter(game => 
    game.roomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.entryFee?.toString().includes(searchTerm) ||
    game.players?.some(p => p.user?.phoneNumber?.includes(searchTerm))
  );

  const stats = {
    total: games.length,
    completed: games.filter(g => g.status === 'completed').length,
    inProgress: games.filter(g => g.status === 'in_progress').length,
    waiting: games.filter(g => g.status === 'waiting').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Games Management</h1>
          <p className="text-gray-400">Monitor battles and declare winners</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaGamepad className="text-purple-400 text-xl" />
            <p className="text-purple-400 text-sm">Total Games</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaTrophy className="text-green-400 text-xl" />
            <p className="text-green-400 text-sm">Completed</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-blue-400 text-xl" />
            <p className="text-blue-400 text-sm">In Progress</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="text-yellow-400 text-xl" />
            <p className="text-yellow-400 text-sm">Waiting</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.waiting}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by room code, entry fee, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          <FaFilter className="text-gray-400 flex-shrink-0" />
          {['all', 'waiting', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-all flex-shrink-0 font-medium ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading games...</p>
          </div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
          <FaGamepad className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No games found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Room Code</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Entry Fee</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Players</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Winner</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-white text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game, index) => (
                  <tr key={game._id} className={`border-t border-gray-700 hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? 'bg-gray-800/50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-purple-400 font-bold font-mono">{game.roomCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-lg">₹{game.entryFee}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-blue-400" />
                        <span className="text-gray-400 font-medium">{game.currentPlayers}/{game.maxPlayers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(game.status)}`}>
                        {getStatusIcon(game.status)} {game.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {game.winner ? (
                        <div className="flex items-center gap-2">
                          <FaTrophy className="text-yellow-400" />
                          <span className="text-green-400 font-semibold">{game.winner?.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(game.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedGame(game)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/30"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedGame(null)}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 w-full max-w-4xl border border-gray-700 shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaGamepad className="text-purple-400" />
                Game Details - {selectedGame.roomCode}
              </h3>
              <button 
                onClick={() => setSelectedGame(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Entry Fee</p>
                <p className="text-white font-bold text-3xl">₹{selectedGame.entryFee}</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Prize Pool</p>
                <p className="text-white font-bold text-3xl">₹{selectedGame.prizePool}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Status</p>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border inline-block ${getStatusColor(selectedGame.status)}`}>
                  {getStatusIcon(selectedGame.status)} {selectedGame.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Players</p>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-blue-400 text-xl" />
                  <p className="text-white font-bold text-xl">{selectedGame.currentPlayers}/{selectedGame.maxPlayers}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
              <h4 className="text-white font-bold text-lg mb-4">Players & Screenshots</h4>
              <div className="space-y-4">
                {selectedGame.players?.map((player, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold truncate">{player.user?.username || player.user?.phoneNumber}</p>
                          <p className="text-gray-400 text-sm">{player.user?.phoneNumber}</p>
                          {player.winScreenshot && (
                            <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                              <FaCheckCircle /> Screenshot uploaded
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {player.winScreenshot && (
                          <a
                            href={player.winScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <FaImage /> View Screenshot
                          </a>
                        )}
                        
                        {selectedGame.status === 'in_progress' && !selectedGame.winner && (
                          <button
                            onClick={() => handleDeclareWinner(player.user._id)}
                            disabled={declaring}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <FaTrophy /> Declare Winner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedGame.winner && (
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Winner</p>
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-400 text-xl" />
                  <p className="text-green-400 font-bold text-lg">{selectedGame.winner?.phoneNumber}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setSelectedGame(null)}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
