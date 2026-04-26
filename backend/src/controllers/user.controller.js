const User = require('../models/User.model');

// Get all staff users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    console.log("Admin requesting all staff users...");

    // Build a filter - by default show all roles except Visitor
    let filter = { role: { $in: ['Admin', 'Employee', 'Security'] } };

    // Allow filtering by a specific role via query param
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Step 1: Find all matching users
    const users = await User.find(filter).sort('-createdAt');

    // Step 2: Send the list back
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.log("Error in getAllUsers:", error);
    next(error);
  }
};

// Create a new staff account (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    console.log("Admin creating a new staff user...");

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const phone = req.body.phone;

    // Step 1: Validate role - admin can only create Employee or Security accounts
    const allowedRoles = ['Employee', 'Security'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'You can only create Employee or Security accounts from here.'
      });
    }

    // Step 2: Check if an account with this email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email already exists.'
      });
    }

    // Step 3: Create the account
    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      role: role,
      phone: phone
    });

    console.log("New staff user created:", newUser.email, "| Role:", newUser.role);

    // Step 4: Send back the created user (without password)
    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    console.log("Error in createUser:", error);
    next(error);
  }
};

// Toggle a user's active/inactive status (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log("Toggling active status for user:", userId);

    // Step 1: Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 2: Prevent admin from deactivating their own account
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.'
      });
    }

    // Step 3: Flip the isActive boolean
    user.isActive = !user.isActive;
    await user.save();

    const statusMsg = user.isActive ? 'activated' : 'deactivated';
    console.log(`User ${user.email} has been ${statusMsg}`);

    res.status(200).json({
      success: true,
      message: `User account has been ${statusMsg}.`,
      data: { isActive: user.isActive }
    });

  } catch (error) {
    console.log("Error in toggleUserStatus:", error);
    next(error);
  }
};

// Delete a user account (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log("Admin deleting user:", userId);

    // Step 1: Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 2: Can't delete your own account
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    // Step 3: Delete it
    await User.findByIdAndDelete(userId);
    console.log("User deleted:", user.email);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      data: {}
    });

  } catch (error) {
    console.log("Error in deleteUser:", error);
    next(error);
  }
};
