const express = require('express');
const { getAdminStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('Admin'), getAdminStats);

module.exports = router;
