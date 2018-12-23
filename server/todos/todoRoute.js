const express = require('express');
const TodoController = require('./TodoController');
const TodoValidator = require('./TodoValidator');

const { createTodo, getTodos, updateTodo } = TodoController;

const { validateUserAuthorization, validateTodoName, validateTodoData } = TodoValidator;

const todoRouter = express.Router();

todoRouter.route('/todo')
  .get(validateUserAuthorization, getTodos)
  .post(validateUserAuthorization, validateTodoName, createTodo)
  .put(validateUserAuthorization, validateTodoName, validateTodoData, updateTodo);

module.exports = todoRouter;
