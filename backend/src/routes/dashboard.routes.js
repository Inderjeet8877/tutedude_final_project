const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Only logged in admins can view the dashboard stats
router.use(authMiddleware.protect);

router.get('/stats', authMiddleware.authorize('Admin'), dashboardController.getAdminStats);

module.exports = router;
