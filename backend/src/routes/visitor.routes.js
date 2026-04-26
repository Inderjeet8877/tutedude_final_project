const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all routes
router.use(authMiddleware.protect);

// Basic CRUD routes
router.get('/', visitorController.getVisitors);
router.post('/', authMiddleware.authorize('Admin', 'Employee'), visitorController.createVisitor);

router.get('/:id', visitorController.getVisitor);
router.put('/:id', authMiddleware.authorize('Admin', 'Security'), visitorController.updateVisitor);
router.delete('/:id', authMiddleware.authorize('Admin'), visitorController.deleteVisitor);

module.exports = router;
