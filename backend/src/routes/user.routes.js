const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes here require a logged-in Admin
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('Admin'));

// GET  /api/users       - list all staff accounts
// POST /api/users       - create a new Employee or Security account
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

// PUT    /api/users/:id/toggle-status  - activate or deactivate a user
// DELETE /api/users/:id                - permanently remove a user
router.put('/:id/toggle-status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
