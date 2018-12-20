const uuidv1 = require('uuid/v1');
const pool = require('../db/index');

/**
 * @class TodoController
 * @classdesc Implements creation of todo
 */
class TodoController {
  /**
   * Create todo
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} status code or message
   * @memberof TodoController
   */
  static createTodo(req, res) {
    const { userId } = req;
    const { todoName } = req.body;

    const text = 'INSERT INTO todos(id, user_id, name) VALUES($1, $2, $3);';
    const values = [uuidv1(), userId, todoName];

    pool.query(text, values)
      .then(() => res.sendStatus(201))
      .catch(() => res.status(500).json({ message: 'There was an error while creating your todo.' }));
  }
}

module.exports = TodoController;
