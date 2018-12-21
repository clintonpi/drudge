const jwt = require('jsonwebtoken');
const pool = require('../db/index');
const sanitizeStr = require('../../utils');

const secretKey = process.env.SECRET_KEY;

/**
 * @class TodoValidator
 * @classdesc Implements validation of user authorization and todo data
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
  static validateUserAuthrization(req, res, next) {
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

    return next();
  }
}

module.exports = TodoValidator;
