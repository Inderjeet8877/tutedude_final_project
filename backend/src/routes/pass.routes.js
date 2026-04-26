const express = require('express');
const router = express.Router();
const passController = require('../controllers/pass.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Require login for all pass routes
router.use(authMiddleware.protect);

// Issue a pass (Admin and Employee only)
router.post('/issue/:appointmentId', authMiddleware.authorize('Admin', 'Employee'), passController.issuePass);

// Verify a pass from the scanner (Security and Admin only)
router.get('/verify/:passCode', authMiddleware.authorize('Admin', 'Security'), passController.verifyPass);

// Allow visitors to see their own passes
router.get('/my-passes', authMiddleware.authorize('Visitor', 'Admin'), passController.getVisitorPasses);

module.exports = router;
