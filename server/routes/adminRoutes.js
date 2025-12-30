import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  getAllTransactions,
  updateTransactionStatus,
  getAllGames,
  getAllKYCRequests,
  updateKYCStatus,
  getAllSupportTickets,
  updateTicketStatus,
  replyToTicket,
  getAppSettings,
  updateAppSettings,
  getAllPolicies,
  getPolicy,
  updatePolicy,
  changeAdminPassword
} from '../controllers/adminController.js';
import { adminProtect, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard', adminProtect, getDashboardStats);

// Admin account management
router.put('/change-password', adminProtect, changeAdminPassword);

// User management
router.get('/users', adminProtect, checkPermission('manage_users'), getAllUsers);
router.get('/user/:id', adminProtect, checkPermission('manage_users'), getUserById);
router.put('/user/:id/block', adminProtect, checkPermission('manage_users'), blockUser);
router.put('/user/:id/unblock', adminProtect, checkPermission('manage_users'), unblockUser);
router.delete('/user/:id', adminProtect, checkPermission('manage_users'), deleteUser);

// Transaction management
router.get('/transactions', adminProtect, checkPermission('manage_transactions'), getAllTransactions);
router.put('/transaction/:id', adminProtect, checkPermission('manage_transactions'), updateTransactionStatus);

// Game management
router.get('/games', adminProtect, checkPermission('manage_games'), getAllGames);

// KYC management
router.get('/kyc', adminProtect, checkPermission('manage_kyc'), getAllKYCRequests);
router.put('/kyc/:id', adminProtect, checkPermission('manage_kyc'), updateKYCStatus);

// Support management
router.get('/support', adminProtect, checkPermission('manage_support'), getAllSupportTickets);
router.put('/support/:id/status', adminProtect, checkPermission('manage_support'), updateTicketStatus);
router.post('/support/:id/reply', adminProtect, checkPermission('manage_support'), replyToTicket);

// Settings management
router.get('/settings', adminProtect, checkPermission('manage_settings'), getAppSettings);
router.put('/settings', adminProtect, checkPermission('manage_settings'), updateAppSettings);

// Policy management
router.get('/policies', adminProtect, checkPermission('manage_settings'), getAllPolicies);
router.get('/policies/:policyKey', adminProtect, checkPermission('manage_settings'), getPolicy);
router.put('/policies/:policyKey', adminProtect, checkPermission('manage_settings'), updatePolicy);

export default router;
