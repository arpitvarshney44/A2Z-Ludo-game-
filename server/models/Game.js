import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['classic', 'quick', 'tournament'],
    default: 'classic'
  },
  roomCode: {
    type: String,
    unique: true
  },
  entryFee: {
    type: Number,
    required: true,
    min: 0
  },
  prizePool: {
    type: Number,
    required: true
  },
  maxPlayers: {
    type: Number,
    default: 2,
    min: 2,
    max: 2
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    avatar: String,
    position: {
      type: Number,
      min: 1,
      max: 4
    },
    color: {
      type: String,
      enum: ['red', 'blue', 'green', 'yellow']
    },
    tokens: [{
      id: Number,
      position: Number,
      isHome: Boolean,
      isFinished: Boolean
    }],
    score: {
      type: Number,
      default: 0
    },
    rank: Number,
    isWinner: {
      type: Boolean,
      default: false
    },
    prizeWon: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date
  }],
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  currentTurn: {
    type: Number,
    default: 0
  },
  diceValue: {
    type: Number,
    min: 1,
    max: 6,
    default: null
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  moves: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    diceValue: Number,
    tokenMoved: Number,
    fromPosition: Number,
    toPosition: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: Date,
  completedAt: Date,
  duration: Number,
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate room code before saving
gameSchema.pre('save', async function(next) {
  if (!this.roomCode) {
    let roomCode;
    let isUnique = false;
    
    while (!isUnique) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingGame = await mongoose.model('Game').findOne({ roomCode });
      if (!existingGame) {
        isUnique = true;
      }
    }
    
    this.roomCode = roomCode;
  }
  next();
});

// Method to check if game is full
gameSchema.methods.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

// Method to add player to game
gameSchema.methods.addPlayer = async function(userId, username, avatar) {
  if (this.isFull()) {
    throw new Error('Game is full');
  }
  
  const colors = ['red', 'green']; // Diagonal colors for 2 players (red bottom-left, green top-right)
  const usedColors = this.players.map(p => p.color);
  const availableColor = colors.find(c => !usedColors.includes(c));
  
  const tokens = [];
  for (let i = 0; i < 4; i++) {
    tokens.push({
      id: i,
      position: -1,
      isHome: true,
      isFinished: false
    });
  }
  
  this.players.push({
    user: userId,
    username,
    avatar,
    position: this.players.length + 1,
    color: availableColor,
    tokens
  });
  
  await this.save();
};

// Method to start game
gameSchema.methods.startGame = async function() {
  if (this.players.length < 2) {
    throw new Error('Need at least 2 players to start');
  }
  
  this.status = 'in_progress';
  this.startedAt = new Date();
  this.currentTurn = 0;
  await this.save();
};

// Method to end game
gameSchema.methods.endGame = async function(winnerId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.winner = winnerId;
  this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  
  // Calculate prize distribution
  const winnerPlayer = this.players.find(p => p.user.toString() === winnerId.toString());
  if (winnerPlayer) {
    winnerPlayer.isWinner = true;
    winnerPlayer.prizeWon = this.prizePool;
    winnerPlayer.rank = 1;
  }
  
  await this.save();
};

const Game = mongoose.model('Game', gameSchema);

export default Game;
