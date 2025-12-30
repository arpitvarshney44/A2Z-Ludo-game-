import Game from '../models/Game.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const initializeSocketHandlers = (io) => {
  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket) => {
    socket.on('join_game', async ({ roomCode, userId }) => {
      try {
        const game = await Game.findOne({ roomCode }).populate('players.user', 'username avatar');

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const playerInGame = game.players.find(p => p.user._id.toString() === userId);
        if (!playerInGame) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }

        socket.join(roomCode);
        socket.userId = userId;
        socket.roomCode = roomCode;
        socket.playerColor = playerInGame.color;

        socket.emit('game_joined', {
          game: {
            roomCode: game.roomCode,
            gameType: game.gameType,
            entryFee: game.entryFee,
            prizePool: game.prizePool,
            status: game.status,
            currentTurn: game.currentTurn,
            diceValue: game.diceValue,
            players: game.players.map(p => ({
              id: p.user._id.toString(),
              username: p.username,
              avatar: p.avatar,
              color: p.color,
              position: p.position,
              tokens: p.tokens,
              score: p.score
            })),
            gameState: game.gameState
          },
          yourColor: playerInGame.color
        });

        socket.to(roomCode).emit('player_joined', {
          player: {
            id: playerInGame.user._id.toString(),
            username: playerInGame.username,
            avatar: playerInGame.avatar,
            color: playerInGame.color
          }
        });

        if (game.status === 'in_progress') {
          gameNamespace.to(roomCode).emit('game_started', {
            message: 'Game is starting!',
            currentTurn: game.currentTurn,
            status: game.status,
            players: game.players.map(p => ({
              id: p.user._id.toString(),
              username: p.username,
              avatar: p.avatar,
              color: p.color,
              tokens: p.tokens,
              score: p.score
            }))
          });
        } else if (game.isFull() && game.status === 'waiting') {
          await game.startGame();
          
          const updatedGame = await Game.findOne({ roomCode }).populate('players.user', 'username avatar');
          
          gameNamespace.to(roomCode).emit('game_started', {
            message: 'Game is starting!',
            currentTurn: updatedGame.currentTurn,
            status: updatedGame.status,
            players: updatedGame.players.map(p => ({
              id: p.user._id.toString(),
              username: p.username,
              avatar: p.avatar,
              color: p.color,
              tokens: p.tokens,
              score: p.score
            }))
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    socket.on('roll_dice', async ({ roomCode, userId }) => {
      try {
        const game = await Game.findOne({ roomCode });

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'in_progress') {
          socket.emit('error', { message: 'Game is not in progress' });
          return;
        }

        const currentPlayer = game.players[game.currentTurn];
        if (currentPlayer.user.toString() !== userId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        const diceValue = Math.floor(Math.random() * 6) + 1;
        game.diceValue = diceValue;

        game.moves.push({
          player: userId,
          action: 'roll_dice',
          diceValue
        });

        const canMove = currentPlayer.tokens.some(token => {
          const pos = token.position;
          if (diceValue === 6) return true;
          return pos > 0;
        });

        if (!canMove) {
          game.currentTurn = (game.currentTurn + 1) % game.players.length;
          game.diceValue = null;
          await game.save();

          gameNamespace.to(roomCode).emit('dice_rolled', {
            playerId: userId,
            diceValue,
            currentTurn: game.currentTurn
          });

          setTimeout(() => {
            gameNamespace.to(roomCode).emit('turn_passed', {
              reason: 'no_valid_moves',
              previousPlayer: userId,
              currentTurn: game.currentTurn
            });
          }, 1000);

          return;
        }

        await game.save();

        gameNamespace.to(roomCode).emit('dice_rolled', {
          playerId: userId,
          diceValue,
          currentTurn: game.currentTurn
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to roll dice' });
      }
    });

    socket.on('move_token', async ({ roomCode, userId, tokenId, fromPosition, toPosition }) => {
      try {
        const game = await Game.findOne({ roomCode });

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'in_progress') {
          socket.emit('error', { message: 'Game is not in progress' });
          return;
        }

        const currentPlayer = game.players[game.currentTurn];
        if (currentPlayer.user.toString() !== userId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        const token = currentPlayer.tokens.find(t => t.id === tokenId);
        if (!token) {
          socket.emit('error', { message: 'Token not found' });
          return;
        }

        token.position = toPosition;
        token.isHome = false;
        
        if (toPosition >= 57) {
          token.isFinished = true;
          currentPlayer.score += 1;
        }

        game.moves.push({
          player: userId,
          action: 'move_token',
          diceValue: game.diceValue,
          tokenMoved: tokenId,
          fromPosition,
          toPosition
        });

        const allTokensFinished = currentPlayer.tokens.every(t => t.isFinished);
        if (allTokensFinished) {
          await game.endGame(userId);

          const user = await User.findById(userId);
          await user.addWinning(game.prizePool);

          await Transaction.create({
            user: userId,
            type: 'game_win',
            amount: game.prizePool,
            status: 'completed',
            gameId: game._id,
            description: `Won game ${game.roomCode}`
          });

          user.totalGamesWon += 1;
          await user.save();

          for (const player of game.players) {
            if (player.user.toString() !== userId) {
              const loserUser = await User.findById(player.user);
              loserUser.totalGamesLost += 1;
              await loserUser.save();
            }
          }

          gameNamespace.to(roomCode).emit('game_ended', {
            winner: {
              id: userId,
              username: currentPlayer.username,
              prizeWon: game.prizePool
            },
            game: {
              roomCode: game.roomCode,
              duration: game.duration,
              players: game.players.map(p => ({
                id: p.user,
                username: p.username,
                rank: p.rank,
                score: p.score,
                isWinner: p.isWinner
              }))
            }
          });

          return;
        }

        if (game.diceValue !== 6) {
          game.currentTurn = (game.currentTurn + 1) % game.players.length;
        }

        game.diceValue = null;
        await game.save();

        gameNamespace.to(roomCode).emit('token_moved', {
          playerId: userId,
          tokenId,
          fromPosition,
          toPosition,
          currentTurn: game.currentTurn,
          playerScore: currentPlayer.score
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to move token' });
      }
    });

    socket.on('leave_game', async ({ roomCode, userId }) => {
      try {
        const game = await Game.findOne({ roomCode });

        if (game && game.status === 'in_progress') {
          const player = game.players.find(p => p.user.toString() === userId);
          if (player) {
            player.leftAt = new Date();
          }
          await game.save();

          socket.to(roomCode).emit('player_left', {
            playerId: userId,
            message: `${player?.username || 'Player'} left the game`
          });
        }

        socket.leave(roomCode);
      } catch (error) {
        // Silent fail
      }
    });

    socket.on('chat_message', async ({ roomCode, userId, message }) => {
      try {
        const game = await Game.findOne({ roomCode });
        if (!game) return;

        const player = game.players.find(p => p.user.toString() === userId);
        if (!player) return;

        gameNamespace.to(roomCode).emit('chat_message', {
          playerId: userId,
          username: player.username,
          avatar: player.avatar,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        // Silent fail
      }
    });

    socket.on('disconnect', () => {
      if (socket.roomCode && socket.userId) {
        socket.to(socket.roomCode).emit('player_disconnected', {
          playerId: socket.userId
        });
      }
    });
  });
};
