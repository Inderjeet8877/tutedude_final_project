const Visitor = require('../models/Visitor.model');
const User = require('../models/User.model');

// @desc    Get all visitors (with optional status filter)
// @route   GET /api/visitors
// @access  Private (Admin, Security, Employee)
exports.getVisitors = async (req, res, next) => {
  try {
    let query;

    // Optional query parameter to filter by status
    if (req.query.status) {
      query = Visitor.find({ status: req.query.status });
    } else {
      query = Visitor.find();
    }

    const visitors = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single visitor
// @route   GET /api/visitors/:id
// @access  Private
exports.getVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.create(req.body);

    // Provide the new visitor with system login credentials automatically
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: 'password123',
        role: 'Visitor',
        phone: req.body.phone || '0000000000'
      });
    }

    res.status(201).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visitor
// @route   PUT /api/visitors/:id
// @access  Private (Admin, Security)
exports.updateVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete visitor
// @route   DELETE /api/visitors/:id
// @access  Private (Admin only)
exports.deleteVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
