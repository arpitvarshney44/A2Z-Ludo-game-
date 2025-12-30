import { useState, useEffect } from 'react';
import { FaGamepad, FaEye, FaSearch, FaFilter, FaTrophy, FaUsers, FaClock, FaDownload } from 'react-icons/fa';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'playing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'playing': return '▶';
      case 'waiting': return '⏳';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  const filteredGames = games.filter(game => 
    game.entryFee?.toString().includes(searchTerm) ||
    game.winner?.phoneNumber?.includes(searchTerm)
  );

  const stats = {
    total: games.length,
    completed: games.filter(g => g.status === 'completed').length,
    playing: games.filter(g => g.status === 'playing').length,
    waiting: games.filter(g => g.status === 'waiting').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Games</h1>
          <p className="text-gray-400">Monitor all game sessions</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 w-fit">
          <FaDownload />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
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
            <p className="text-blue-400 text-sm">Playing</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.playing}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="text-yellow-400 text-xl" />
            <p className="text-yellow-400 text-sm">Waiting</p>
          </div>
          <p className="text-white text-2xl lg:text-3xl font-bold">{stats.waiting}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by entry fee or winner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          <FaFilter className="text-gray-400 flex-shrink-0" />
          {['all', 'waiting', 'playing', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-all flex-shrink-0 font-medium ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {f}
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
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredGames.map((game) => (
              <div key={game._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <FaGamepad className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">₹{game.entryFee}</p>
                      <p className="text-gray-400 text-sm">{game.players?.length || 0} players</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(game.status)}`}>
                    {getStatusIcon(game.status)} {game.status}
                  </span>
                </div>
                
                {game.winner && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-400" />
                      <div>
                        <p className="text-gray-400 text-xs">Winner</p>
                        <p className="text-green-400 font-semibold">{game.winner?.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">{new Date(game.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <FaEye /> View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                  <tr>
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
                        <div className="flex items-center gap-2">
                          <FaGamepad className="text-purple-400" />
                          <span className="text-white font-bold text-lg">₹{game.entryFee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-blue-400" />
                          <span className="text-gray-400 font-medium">{game.players?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(game.status)}`}>
                          {getStatusIcon(game.status)} {game.status}
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
        </>
      )}

      {/* Game Detail Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedGame(null)}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 w-full max-w-lg border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaGamepad className="text-purple-400" />
                Game Details
              </h3>
              <button 
                onClick={() => setSelectedGame(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Entry Fee</p>
                <p className="text-white font-bold text-3xl">₹{selectedGame.entryFee}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Status</p>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border inline-block ${getStatusColor(selectedGame.status)}`}>
                  {getStatusIcon(selectedGame.status)} {selectedGame.status}
                </span>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Players</p>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-blue-400 text-xl" />
                  <p className="text-white font-bold text-xl">{selectedGame.players?.length || 0}</p>
                </div>
              </div>
              
              {selectedGame.winner && (
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Winner</p>
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-yellow-400 text-xl" />
                    <p className="text-green-400 font-bold text-lg">{selectedGame.winner?.phoneNumber}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Created At</p>
                <p className="text-white font-semibold">{new Date(selectedGame.createdAt).toLocaleString()}</p>
              </div>
              
              {selectedGame.players && selectedGame.players.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-3">Players List</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedGame.players.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-white text-sm">{player?.phoneNumber || 'Unknown'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedGame(null)}
              className="w-full mt-6 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
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
