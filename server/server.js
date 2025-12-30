import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import configRoutes from './routes/configRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocketHandlers } from './socket/gameSocket.js';
import { getPublicPolicy } from './controllers/adminController.js';
import { initializeDefaultConfigs } from './controllers/configController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Initialize default configurations
initializeDefaultConfigs();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/config', configRoutes);

// Public policy route
app.get('/api/policies/:policyKey', getPublicPolicy);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.IO initialization
initializeSocketHandlers(io);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export { io };
