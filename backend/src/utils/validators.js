const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
});

module.exports = {
  registerSchema,
  loginSchema,
  taskSchema,
};
