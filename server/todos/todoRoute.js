const express = require('express');
const TodoController = require('./TodoController');
const TodoValidator = require('./TodoValidator');

const { createTodo } = TodoController;

const { validateUserAuthrization, validateTodoName } = TodoValidator;

const todoRouter = express.Router();

todoRouter.route('/todo')
  .post(validateUserAuthrization, validateTodoName, createTodo);

module.exports = todoRouter;
