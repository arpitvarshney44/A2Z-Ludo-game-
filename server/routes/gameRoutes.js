import express from 'express';
import { createGame, joinGame, getAvailableGames, getGameByRoomCode, getGameHistory } from '../controllers/gameController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createGame);
router.post('/join/:roomCode', protect, joinGame);
router.get('/available', protect, getAvailableGames);
router.get('/history', protect, getGameHistory);
router.get('/:roomCode', protect, getGameByRoomCode);

export default router;
