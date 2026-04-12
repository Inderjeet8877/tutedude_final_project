const User = require('../models/User.model');

// Helper to send normalized JWT responses
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

/**
 * @desc    Register a new user (Primarily for Admin to create employees/security, or open for visitors)
 * @route   POST /api/auth/register
 * @access  Public (Can be restricted later)
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Optional: Only Admin can create Admin/Security
    // For now, allow basic registration for demo purposes
    const user = await User.create({ name, email, password, role, phone });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & pwd
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check user & select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // User active check
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account disabled. Contact Admin.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // expire in 10 secs
      httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
