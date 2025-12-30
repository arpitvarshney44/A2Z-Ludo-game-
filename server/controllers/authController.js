import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTP } from '../config/twilio.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTPController = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phoneNumber });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      phoneNumber,
      otp
    });

    // Send OTP via Twilio (in development, you might want to skip this)
    if (process.env.NODE_ENV === 'production') {
      await sendOTP(phoneNumber, otp);
    } else {
      console.log(`OTP for ${phoneNumber}: ${otp}`);
    }

    res.status(200).json({
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp }) // Only send OTP in response during development
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTPController = async (req, res) => {
  try {
    const { phoneNumber, otp, referralCode, deviceInfo } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phoneNumber, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is already verified
    if (otpRecord.verified) {
      return res.status(400).json({ message: 'OTP already used' });
    }

    // Check OTP attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      
      // Generate unique referral code
      let referralCodeGenerated;
      let isUnique = false;
      while (!isUnique) {
        referralCodeGenerated = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingUser = await User.findOne({ referralCode: referralCodeGenerated });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      user = await User.create({
        phoneNumber,
        referralCode: referralCodeGenerated,
        referredBy: referralCode || null,
        deviceInfo: deviceInfo || {},
        bonusCash: 50 // Welcome bonus
      });

      // If referred by someone, add bonus to referrer
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referrer.referralEarnings += 25;
          referrer.bonusCash += 25;
          referrer.referredUsers.push(user._id);
          await referrer.save();
        }
      }
    } else {
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked. Please contact support for assistance.' 
        });
      }

      // Update last login and device info
      user.lastLogin = new Date();
      if (deviceInfo) {
        user.deviceInfo = deviceInfo;
      }
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: isNewUser ? 'Registration successful' : 'Login successful',
      isNewUser,
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        referralCode: user.referralCode,
        depositCash: user.depositCash,
        winningCash: user.winningCash,
        bonusCash: user.bonusCash,
        totalBalance: user.getTotalBalance(),
        isKYCVerified: user.isKYCVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    
    res.status(200).json({
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        referralCode: user.referralCode,
        depositCash: user.depositCash,
        winningCash: user.winningCash,
        bonusCash: user.bonusCash,
        totalBalance: user.getTotalBalance(),
        totalCoinsWon: user.totalCoinsWon,
        totalWithdrawal: user.totalWithdrawal,
        totalGamesPlayed: user.totalGamesPlayed,
        totalGamesWon: user.totalGamesWon,
        totalGamesLost: user.totalGamesLost,
        referralEarnings: user.referralEarnings,
        referredUsers: user.referredUsers.length,
        isKYCVerified: user.isKYCVerified,
        kycStatus: user.kycDetails?.status || 'not_submitted',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Failed to get user profile', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Failed to logout', error: error.message });
  }
};
