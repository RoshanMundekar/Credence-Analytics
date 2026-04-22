const pool = require('../config/db');
const { taskSchema } = require('../utils/validators');

// GET /api/admin/users - list all users with their task counts
const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.createdAt,
        COUNT(t.id) AS taskCount
       FROM users u
       LEFT JOIN tasks t ON t.userId = u.id AND t.isDeleted = false
       WHERE u.role != 'admin'
       GROUP BY u.id
       ORDER BY u.createdAt DESC`
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/tasks - list ALL tasks across all users with optional search/filter/pagination
const getAllTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, userId } = req.query;
    const skip = (page - 1) * limit;

    let query = `
      SELECT t.*, u.name AS userName, u.email AS userEmail
      FROM tasks t
      JOIN users u ON t.userId = u.id
      WHERE t.isDeleted = false
    `;
    const params = [];

    if (userId) {
      query += ' AND t.userId = ?';
      params.push(userId);
    }
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND t.title LIKE ?';
      params.push(`%${search}%`);
    }

    // Count
    const countQuery = query.replace(
      'SELECT t.*, u.name AS userName, u.email AS userEmail',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY t.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(skip));

    const [tasks] = await pool.query(query, params);

    res.json({ tasks, page: parseInt(page), pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/tasks - create task for any user
const adminCreateTask = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) { res.status(400); throw new Error(error.details[0].message); }

    const { title, description, status, dueDate } = value;
    const { userId } = req.body;

    if (!userId) { res.status(400); throw new Error('userId is required'); }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status, dueDate, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description || null, status || 'pending', dueDate ? new Date(dueDate) : null, userId]
    );
    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/tasks/:id - update any task
const adminUpdateTask = async (req, res, next) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ? AND isDeleted = false', [req.params.id]);
    if (tasks.length === 0) { res.status(404); throw new Error('Task not found'); }

    const { error, value } = taskSchema.validate(req.body);
    if (error) { res.status(400); throw new Error(error.details[0].message); }

    const { title, description, status, dueDate } = value;

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, dueDate = ?, updatedAt = NOW() WHERE id = ?',
      [title, description || null, status, dueDate ? new Date(dueDate) : null, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/tasks/:id - soft delete any task
const adminDeleteTask = async (req, res, next) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ? AND isDeleted = false', [req.params.id]);
    if (tasks.length === 0) { res.status(404); throw new Error('Task not found'); }

    await pool.query('UPDATE tasks SET isDeleted = true, updatedAt = NOW() WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllTasks,
  adminCreateTask,
  adminUpdateTask,
  adminDeleteTask,
};
