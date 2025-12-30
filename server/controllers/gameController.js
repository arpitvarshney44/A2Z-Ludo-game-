import Game from '../models/Game.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AppConfig from '../models/AppConfig.js';

// Helper function to get commission rate
const getCommissionRate = async () => {
  try {
    const config = await AppConfig.findOne({ key: 'commissionRate' });
    return config ? config.value : 5; // Default 5% if not found
  } catch (error) {
    return 5; // Default 5% on error
  }
};

// @desc    Create new game
// @route   POST /api/game/create
// @access  Private
export const createGame = async (req, res) => {
  try {
    const { gameType, entryFee, maxPlayers } = req.body;

    if (!entryFee || entryFee < 0) {
      return res.status(400).json({ message: 'Invalid entry fee' });
    }

    const user = await User.findById(req.user._id);
    const totalBalance = user.getTotalBalance();

    if (totalBalance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Get dynamic commission rate
    const commissionRate = await getCommissionRate();
    const commissionMultiplier = (100 - commissionRate) / 100;
    
    // Calculate prize pool based on dynamic commission
    const prizePool = entryFee * maxPlayers * commissionMultiplier;

    const game = await Game.create({
      gameType: gameType || 'classic',
      entryFee,
      prizePool,
      maxPlayers: 2, // Only 2 players allowed
      createdBy: req.user._id
    });

    // Add creator as first player
    await game.addPlayer(req.user._id, user.username || user.phoneNumber, user.avatar);

    // Deduct entry fee
    await user.deductGameEntry(entryFee);

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'game_entry',
      amount: entryFee,
      status: 'completed',
      gameId: game._id,
      description: `Game entry fee for ${game.roomCode}`
    });

    res.status(201).json({
      message: 'Game created successfully',
      game: {
        id: game._id,
        roomCode: game.roomCode,
        gameType: game.gameType,
        entryFee: game.entryFee,
        prizePool: game.prizePool,
        maxPlayers: game.maxPlayers,
        currentPlayers: game.players.length,
        status: game.status
      }
    });
  } catch (error) {
    console.error('Create Game Error:', error);
    res.status(500).json({ message: 'Failed to create game', error: error.message });
  }
};

// @desc    Join existing game
// @route   POST /api/game/join/:roomCode
// @access  Private
export const joinGame = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const game = await Game.findOne({ roomCode, status: 'waiting' });

    if (!game) {
      return res.status(404).json({ message: 'Game not found or already started' });
    }

    if (game.isFull()) {
      return res.status(400).json({ message: 'Game is full' });
    }

    // Check if user already in game
    const alreadyJoined = game.players.some(p => p.user.toString() === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this game' });
    }

    const user = await User.findById(req.user._id);
    const totalBalance = user.getTotalBalance();

    if (totalBalance < game.entryFee) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Add player to game
    await game.addPlayer(req.user._id, user.username || user.phoneNumber, user.avatar);

    // Deduct entry fee
    await user.deductGameEntry(game.entryFee);

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'game_entry',
      amount: game.entryFee,
      status: 'completed',
      gameId: game._id,
      description: `Game entry fee for ${game.roomCode}`
    });

    // If game is full, start it
    if (game.isFull()) {
      await game.startGame();
    }

    res.status(200).json({
      message: 'Joined game successfully',
      game: {
        id: game._id,
        roomCode: game.roomCode,
        gameType: game.gameType,
        entryFee: game.entryFee,
        prizePool: game.prizePool,
        maxPlayers: game.maxPlayers,
        currentPlayers: game.players.length,
        status: game.status,
        players: game.players.map(p => ({
          username: p.username,
          avatar: p.avatar,
          color: p.color
        }))
      }
    });
  } catch (error) {
    console.error('Join Game Error:', error);
    res.status(500).json({ message: 'Failed to join game', error: error.message });
  }
};

// @desc    Get available games
// @route   GET /api/game/available
// @access  Private
export const getAvailableGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      $or: [
        { status: 'waiting', isActive: true },
        { status: 'in_progress', isActive: true }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('roomCode gameType entryFee prizePool maxPlayers players status createdAt');

    const formattedGames = games.map(game => ({
      id: game._id,
      roomCode: game.roomCode,
      gameType: game.gameType,
      entryFee: game.entryFee,
      prizePool: game.prizePool,
      maxPlayers: game.maxPlayers,
      currentPlayers: game.players.length,
      players: game.players.map(p => ({ user: p.user.toString() })), // Include player user IDs
      status: game.status,
      createdAt: game.createdAt
    }));

    res.status(200).json({ games: formattedGames });
  } catch (error) {
    console.error('Get Available Games Error:', error);
    res.status(500).json({ message: 'Failed to get available games', error: error.message });
  }
};

// @desc    Get game by room code
// @route   GET /api/game/:roomCode
// @access  Private
export const getGameByRoomCode = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const game = await Game.findOne({ roomCode })
      .populate('players.user', 'username avatar phoneNumber');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({ game });
  } catch (error) {
    console.error('Get Game Error:', error);
    res.status(500).json({ message: 'Failed to get game', error: error.message });
  }
};

// @desc    Get user's game history
// @route   GET /api/game/history
// @access  Private
export const getGameHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const games = await Game.find({
      'players.user': req.user._id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('roomCode gameType entryFee prizePool players winner status completedAt duration');

    const total = await Game.countDocuments({
      'players.user': req.user._id,
      status: 'completed'
    });

    const formattedGames = games.map(game => {
      const userPlayer = game.players.find(p => p.user.toString() === req.user._id.toString());
      return {
        id: game._id,
        roomCode: game.roomCode,
        gameType: game.gameType,
        entryFee: game.entryFee,
        prizePool: game.prizePool,
        isWinner: userPlayer?.isWinner || false,
        prizeWon: userPlayer?.prizeWon || 0,
        rank: userPlayer?.rank || 0,
        completedAt: game.completedAt,
        duration: game.duration
      };
    });

    res.status(200).json({
      games: formattedGames,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Game History Error:', error);
    res.status(500).json({ message: 'Failed to get game history', error: error.message });
  }
};
