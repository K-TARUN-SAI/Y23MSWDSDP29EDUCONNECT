const User = require('../models/User');
const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    await Token.create({ userId: user._id, token: refreshToken });

    // Set cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email); // Debug log

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email); // Debug log
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for email:', email); // Debug log
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    console.log('User found and password matched:', user); // Debug log

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    await Token.create({ userId: user._id, token: refreshToken });
    console.log('Refresh token saved for user:', user._id); // Debug log

    // Set cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    console.log('Refresh token cookie set'); // Debug log

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
    console.log('Login response sent for user:', user._id); // Debug log
  } catch (error) {
    console.error('Login error:', error); // Debug log
    next(error);
  }
};

// @desc    Logout user / Clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token from DB
    await Token.findOneAndDelete({ token: req.cookies.refreshToken });

    // Clear cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  try {
    if (!refreshToken) {
      return next(new ErrorResponse('Not authorized, no refresh token', 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check if token exists in DB
    const token = await Token.findOne({ 
      userId: decoded.id, 
      token: refreshToken 
    });

    if (!token) {
      return next(new ErrorResponse('Not authorized, token not found', 401));
    }

    // Generate new access token
    const accessToken = generateToken(decoded.id);

    res.status(200).json({
      success: true,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};