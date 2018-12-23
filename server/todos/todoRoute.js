const express = require('express');
const TodoController = require('./TodoController');
const TodoValidator = require('./TodoValidator');

const { createTodo, getTodos, updateTodo } = TodoController;

const { validateUserAuthrization, validateTodoName, validateTodoData } = TodoValidator;

const todoRouter = express.Router();

todoRouter.route('/todo')
  .get(validateUserAuthrization, getTodos)
  .post(validateUserAuthrization, validateTodoName, createTodo)
  .put(validateUserAuthrization, validateTodoName, validateTodoData, updateTodo);

module.exports = todoRouter;
