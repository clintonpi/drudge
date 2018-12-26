const jwt = require('jsonwebtoken');
const pool = require('../db/index');
const sanitizeStr = require('../../utils');

const secretKey = process.env.SECRET_KEY;

/**
 * @class TodoValidator
 * @classdesc Implements validation of user authorization, todo data and todos to be deleted
 */
class TodoValidator {
  /**
   * Validate user authorization
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof TodoValidator
   */
  static validateUserAuthorization(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) return res.redirect('/login');

    const token = authorization.split(' ')[1];
    if (!token) return res.redirect('/login');

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.redirect('/login');

      const text = 'SELECT id FROM users WHERE id = $1;';
      const values = [user.id];

      pool.query(text, values)
        .then((result) => {
          if (result.rows.length === 0) return res.redirect('/login');
          req.userId = user.id;
          return next();
        })
        .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
    });
  }

  /**
   * Validate todo name
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof TodoValidator
   */
  static validateTodoName(req, res, next) {
    const { todoName } = req.body;

    if (!todoName) return res.status(400).json({ message: 'Your request was incomplete.' });

    if (typeof todoName !== 'string') return res.status(400).json({ message: 'Your todo was invalid.' });

    const sanitizedTodo = sanitizeStr(todoName);
    if (sanitizedTodo.length < 1) return res.status(400).json({ message: 'Your todo was invalid.' });

    req.sanitizedTodo = sanitizedTodo;
    return next();
  }

  /**
   * Validate todo data
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof TodoValidator
   */
  static validateTodoData(req, res, next) {
    const { todoId, isDone } = req.body;
    const { userId } = req;

    if (!todoId || (!isDone && isDone !== false)) return res.status(400).json({ message: 'Your request was incomplete.' });

    if (typeof isDone !== 'boolean') return res.status(400).json({ message: 'Your todo status was invalid.' });

    const text = 'SELECT id, user_id, name, done FROM todos WHERE id = $1;';
    const values = [todoId];

    pool.query(text, values)
      .then((result) => {
        const resultRows = result.rows;

        if (resultRows.length === 0) return res.status(400).json({ message: 'This todo does not exist.' });

        if (resultRows[0].user_id !== userId) return res.status(400).json({ message: 'You are not the owner of this todo.' });

        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
  }

  /**
   * Validate todos to be deleted
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof TodoValidator
   */
  static validateTodosToBeDeleted(req, res, next) {
    const { todosId } = req.body;
    const { userId } = req;

    if (!todosId) return res.status(400).json({ message: 'Your request was incomplete.' });

    if (!Array.isArray(todosId)) return res.status(400).json({ message: 'Your request was invalid.' });

    const todosIdLength = todosId.length;
    if (todosIdLength === 0) return res.status(400).json({ message: 'Your request was invalid.' });

    const generateParameters = (length) => {
      const parameters = [];
      for (let i = 1; i <= length; i += 1) {
        parameters.push(`$${i}`);
      }
      return parameters;
    };

    const parameters = generateParameters(todosIdLength);

    const text = `SELECT id, user_id FROM todos WHERE id IN (${parameters});`;
    const values = todosId;

    pool.query(text, values)
      .then((result) => {
        const resultRows = result.rows;
        const resultRowsLength = resultRows.length;

        if (resultRowsLength === 0 || resultRowsLength < todosIdLength) {
          if (todosIdLength === 1) {
            return res.status(400).json({ message: 'This todo does not exist.' });
          }
          return res.status(400).json({ message: 'Some of these todos do not exist.' });
        }

        const invalidTodos = resultRows.filter(row => row.user_id !== userId);

        if (invalidTodos.length > 0) {
          if (todosIdLength === 1) {
            return res.status(400).json({ message: 'You are not the owner of this todo.' });
          }
          return res.status(400).json({ message: 'You are not the owner of some of these todos.' });
        }

        req.parameters = parameters;
        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while deleting your todo(s).' }));
  }
}

module.exports = TodoValidator;
