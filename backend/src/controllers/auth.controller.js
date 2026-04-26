const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    // 1. Get user details from the request body
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const phone = req.body.phone;

    // 2. Create the user in the database
    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      role: role,
      phone: phone
    });

    // 3. Generate a JWT token for the new user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 4. Send the response back to the client
    res.status(201).json({
      success: true,
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    // If there is any error, send it to the error handler middleware
    console.log("Error in register:", error);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    // 1. Get email and password from request body
    const email = req.body.email;
    const password = req.body.password;

    // 2. Make sure they provided both
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // 3. Find the user in the database
    // We use +password to get the password field because it is hidden by default in the model
    const user = await User.findOne({ email: email }).select('+password');
    
    // 4. If user not found, return error
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 5. Check if the given password matches the database password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 6. Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account disabled. Contact Admin.' });
    }

    // 7. Create JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 8. Generate cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    // 9. Send response with cookie and json data
    res.status(200).cookie('token', token, cookieOptions).json({
      success: true,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("Error in login:", error);
    next(error);
  }
};

// Get current logged in user
exports.getMe = async (req, res, next) => {
  try {
    // 1. Find user by id from the token (which is added to req by the auth middleware)
    const user = await User.findById(req.user.id);
    
    // 2. Send the user back
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in getMe:", error);
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // 1. Overwrite the token cookie with a dummy value and make it expire immediately
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true
    });

    // 2. Send success response
    res.status(200).json({ success: true, message: "Logged out successfully", data: {} });
  } catch (error) {
    console.log("Error in logout:", error);
    next(error);
  }
};
