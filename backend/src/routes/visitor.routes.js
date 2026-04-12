const express = require('express');
const {
  getVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} = require('../controllers/visitor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

router
  .route('/')
  .get(getVisitors)
  .post(authorize('Admin', 'Employee'), createVisitor);

router
  .route('/:id')
  .get(getVisitor)
  .put(authorize('Admin', 'Security'), updateVisitor)
  .delete(authorize('Admin'), deleteVisitor);

module.exports = router;
