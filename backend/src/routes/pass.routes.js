const express = require('express');
const { issuePass, verifyPass, getVisitorPasses } = require('../controllers/pass.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/my-passes', authorize('Visitor', 'Admin'), getVisitorPasses);
router.post('/issue/:appointmentId', authorize('Admin', 'Employee'), issuePass);
router.get('/verify/:passCode', authorize('Admin', 'Security'), verifyPass);

module.exports = router;
