import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Support from '../models/Support.js';
import AppSettings from '../models/AppSettings.js';
import Policy from '../models/Policy.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const kycPending = await User.countDocuments({ 'kycDetails.status': 'pending' });
    
    const totalTransactions = await Transaction.countDocuments();
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const openTickets = await Support.countDocuments({ status: 'open' });
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('phoneNumber username avatar createdAt');
    
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'phoneNumber username')
      .select('type amount status transactionId createdAt');

    res.status(200).json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          kycPending
        },
        games: {
          total: 0,
          active: 0,
          completed: 0
        },
        transactions: {
          total: totalTransactions,
          pendingWithdrawals,
          totalDeposits: totalDeposits[0]?.total || 0,
          totalWithdrawals: totalWithdrawals[0]?.total || 0
        },
        support: {
          openTickets
        }
      },
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search ? {
      $or: [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/user/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('referredUsers', 'username phoneNumber avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      user,
      recentTransactions: transactions,
      recentGames: []
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

// @desc    Block user
// @route   PUT /api/admin/user/:id/block
// @access  Private (Admin)
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block User Error:', error);
    res.status(500).json({ message: 'Failed to block user', error: error.message });
  }
};

// @desc    Unblock user
// @route   PUT /api/admin/user/:id/unblock
// @access  Private (Admin)
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock User Error:', error);
    res.status(500).json({ message: 'Failed to unblock user', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has balance
    const totalBalance = user.depositCash + user.winningCash + user.bonusCash;
    if (totalBalance > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user with balance. User has ₹${totalBalance} in wallet.` 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('user', 'phoneNumber username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get All Transactions Error:', error);
    res.status(500).json({ message: 'Failed to get transactions', error: error.message });
  }
};

// @desc    Update transaction status
// @route   PUT /api/admin/transaction/:id
// @access  Private (Admin)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes || transaction.adminNotes;
    transaction.processedBy = req.admin._id;
    transaction.processedAt = new Date();

    // If withdrawal is completed, update user's total withdrawal
    if (transaction.type === 'withdrawal' && status === 'completed') {
      const user = await User.findById(transaction.user);
      user.totalWithdrawal += transaction.amount;
      await user.save();
    }

    // If withdrawal is failed or cancelled, refund to user
    if (transaction.type === 'withdrawal' && (status === 'failed' || status === 'cancelled')) {
      const user = await User.findById(transaction.user);
      user.winningCash += transaction.amount;
      await user.save();
    }

    await transaction.save();

    res.status(200).json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({ message: 'Failed to update transaction', error: error.message });
  }
};

// @desc    Get all games
// @route   GET /api/admin/games
// @access  Private (Admin)
export const getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Return empty games list since game functionality is removed
    res.status(200).json({
      games: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('Get All Games Error:', error);
    res.status(500).json({ message: 'Failed to get games', error: error.message });
  }
};

// @desc    Get all KYC requests
// @route   GET /api/admin/kyc
// @access  Private (Admin)
export const getAllKYCRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Build query - if status is empty or 'all', get all KYC submissions
    let query = { 'kycDetails.submittedAt': { $exists: true } };
    if (status && status !== 'all' && status !== '') {
      query['kycDetails.status'] = status;
    }

    const users = await User.find(query)
      .sort({ 'kycDetails.submittedAt': -1 })
      .skip(skip)
      .limit(limit)
      .select('phoneNumber username email kycDetails');

    const total = await User.countDocuments(query);

    res.status(200).json({
      kycRequests: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get KYC Requests Error:', error);
    res.status(500).json({ message: 'Failed to get KYC requests', error: error.message });
  }
};

// @desc    Update KYC status
// @route   PUT /api/admin/kyc/:id
// @access  Private (Admin)
export const updateKYCStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycDetails.status = status;
    
    if (status === 'approved') {
      user.isKYCVerified = true;
      user.kycDetails.verifiedAt = new Date();
    } else if (status === 'rejected') {
      user.isKYCVerified = false;
      user.kycDetails.rejectionReason = rejectionReason;
    }

    await user.save();

    res.status(200).json({
      message: `KYC ${status} successfully`,
      user
    });
  } catch (error) {
    console.error('Update KYC Status Error:', error);
    res.status(500).json({ message: 'Failed to update KYC status', error: error.message });
  }
};

// @desc    Get all support tickets
// @route   GET /api/admin/support
// @access  Private (Admin)
export const getAllSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status ? { status } : {};

    const tickets = await Support.find(query)
      .populate('user', 'phoneNumber username email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Support.countDocuments(query);

    res.status(200).json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Support Tickets Error:', error);
    res.status(500).json({ message: 'Failed to get support tickets', error: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/support/:id/status
// @access  Private (Admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Support.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    ticket.assignedTo = req.admin._id;

    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    res.status(200).json({
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update Ticket Status Error:', error);
    res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
};

// @desc    Reply to ticket
// @route   POST /api/admin/support/:id/reply
// @access  Private (Admin)
export const replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await Support.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'admin',
      senderName: req.admin.name,
      message
    });

    ticket.status = 'in_progress';
    ticket.assignedTo = req.admin._id;

    await ticket.save();

    res.status(200).json({
      message: 'Reply sent successfully',
      ticket
    });
  } catch (error) {
    console.error('Reply to Ticket Error:', error);
    res.status(500).json({ message: 'Failed to reply to ticket', error: error.message });
  }
};

// @desc    Get app settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getAppSettings = async (req, res) => {
  try {
    const settings = await AppSettings.find();
    res.status(200).json({ settings });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({ message: 'Failed to get settings', error: error.message });
  }
};

// @desc    Update app settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateAppSettings = async (req, res) => {
  try {
    const { settingKey, settingValue, description, category } = req.body;

    let setting = await AppSettings.findOne({ settingKey });

    if (setting) {
      setting.settingValue = settingValue;
      setting.description = description || setting.description;
      setting.category = category || setting.category;
      setting.updatedBy = req.admin._id;
      await setting.save();
    } else {
      setting = await AppSettings.create({
        settingKey,
        settingValue,
        description,
        category,
        updatedBy: req.admin._id
      });
    }

    res.status(200).json({
      message: 'Settings updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};


// @desc    Get all policies
// @route   GET /api/admin/policies
// @access  Private (Admin)
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ policyKey: 1 });
    res.status(200).json({ policies });
  } catch (error) {
    console.error('Get All Policies Error:', error);
    res.status(500).json({ message: 'Failed to get policies', error: error.message });
  }
};

// @desc    Get policy by key
// @route   GET /api/admin/policies/:policyKey
// @access  Private (Admin)
export const getPolicy = async (req, res) => {
  try {
    const { policyKey } = req.params;
    const policy = await Policy.findOne({ policyKey });
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found', policy: null });
    }
    
    res.status(200).json({ policy });
  } catch (error) {
    console.error('Get Policy Error:', error);
    res.status(500).json({ message: 'Failed to get policy', error: error.message });
  }
};

// @desc    Update or create policy
// @route   PUT /api/admin/policies/:policyKey
// @access  Private (Admin)
export const updatePolicy = async (req, res) => {
  try {
    const { policyKey } = req.params;
    const { title, sections } = req.body;

    let policy = await Policy.findOne({ policyKey });

    if (policy) {
      policy.title = title;
      policy.sections = sections;
      policy.updatedBy = req.admin._id;
      await policy.save();
    } else {
      policy = await Policy.create({
        policyKey,
        title,
        sections,
        updatedBy: req.admin._id
      });
    }

    res.status(200).json({
      message: 'Policy updated successfully',
      policy
    });
  } catch (error) {
    console.error('Update Policy Error:', error);
    res.status(500).json({ message: 'Failed to update policy', error: error.message });
  }
};

// @desc    Get policy for public (client app)
// @route   GET /api/policies/:policyKey
// @access  Public
export const getPublicPolicy = async (req, res) => {
  try {
    const { policyKey } = req.params;
    const policy = await Policy.findOne({ policyKey, isActive: true });
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    res.status(200).json({ policy });
  } catch (error) {
    console.error('Get Public Policy Error:', error);
    res.status(500).json({ message: 'Failed to get policy', error: error.message });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};
