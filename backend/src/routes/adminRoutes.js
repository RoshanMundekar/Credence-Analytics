const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  getAllTasks,
  adminCreateTask,
  adminUpdateTask,
  adminDeleteTask,
} = require('../controllers/adminController');

// All admin routes are protected + admin-only
router.use(protect, adminOnly);

router.get('/users', getAllUsers);

router.get('/tasks', getAllTasks);
router.post('/tasks', adminCreateTask);
router.put('/tasks/:id', adminUpdateTask);
router.delete('/tasks/:id', adminDeleteTask);

module.exports = router;
