const pool = require('../config/db');
const { taskSchema } = require('../utils/validators');

const createTask = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { title, description, status, dueDate } = value;

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status, dueDate, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description || null, status || 'pending', dueDate ? new Date(dueDate) : null, req.user.id]
    );

    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);

    res.status(201).json(newTask[0]);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = 'SELECT * FROM tasks WHERE userId = ? AND isDeleted = false';
    const queryParams = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND title LIKE ?';
      queryParams.push(`%${search}%`);
    }

    // Count query
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Add order and pagination
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(skip));

    const [tasks] = await pool.query(query, queryParams);

    res.json({
      tasks,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ? AND isDeleted = false',
      [req.params.id, req.user.id]
    );

    if (tasks.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json(tasks[0]);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ? AND isDeleted = false',
      [req.params.id, req.user.id]
    );

    if (tasks.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { title, description, status, dueDate } = value;

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, dueDate = ?, updatedAt = NOW() WHERE id = ?',
      [title, description || null, status, dueDate ? new Date(dueDate) : null, req.params.id]
    );

    const [updatedTasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

    res.json(updatedTasks[0]);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND userId = ? AND isDeleted = false',
      [req.params.id, req.user.id]
    );

    if (tasks.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Soft delete
    await pool.query('UPDATE tasks SET isDeleted = true, updatedAt = NOW() WHERE id = ?', [req.params.id]);

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
