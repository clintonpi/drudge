const express = require('express');
const TodoController = require('./TodoController');
const TodoValidator = require('./TodoValidator');

const { createTodo, getTodos } = TodoController;

const { validateUserAuthrization, validateTodoName } = TodoValidator;

const todoRouter = express.Router();

todoRouter.route('/todo')
  .get(validateUserAuthrization, getTodos)
  .post(validateUserAuthrization, validateTodoName, createTodo);

module.exports = todoRouter;
