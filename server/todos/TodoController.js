const uuidv1 = require('uuid/v1');
const pool = require('../db/index');

/**
 * @class TodoController
 * @classdesc Implements creation, getting, updating and deleting of todos
 */
class TodoController {
  /**
   * Create todo
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} todo id or message
   * @memberof TodoController
   */
  static createTodo(req, res) {
    const { userId } = req;
    const { todoName } = req.body;

    const text = 'INSERT INTO todos(id, user_id, name) VALUES($1, $2, $3) RETURNING *;';
    const values = [uuidv1(), userId, todoName];

    pool.query(text, values)
      .then(result => res.status(201).json({ todoId: result.rows[0].id }))
      .catch(() => res.status(500).json({ message: 'There was an error while creating your todo.' }));
  }

  /**
   * Get todo
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} todos or message
   * @memberof TodoController
   */
  static getTodos(req, res) {
    const { userId } = req;

    const text = 'SELECT id, name, done from todos WHERE user_id = $1;';
    const values = [userId];

    pool.query(text, values)
      .then((result) => {
        if (result.rows.length === 0) return res.status(200).json({ message: 'You have no todo.' });

        return res.status(200).json({ todos: result.rows });
      })
      .catch(() => res.status(500).json({ message: 'There was an error while getting your todos.' }));
  }

  /**
   * Update todo
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} status code or message
   * @memberof TodoController
   */
  static updateTodo(req, res) {
    const { todoId, isDone } = req.body;
    const { sanitizedTodo } = req;

    const text = 'UPDATE todos SET name = $1, done = $2 WHERE id = $3;';
    const values = [sanitizedTodo, isDone, todoId];

    pool.query(text, values)
      .then(() => res.sendStatus(200))
      .catch(() => res.status(500).json({ message: 'There was an error while updating your todo.' }));
  }

  /**
   * Delete todo
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} status code or message
   * @memberof TodoController
   */
  static deleteTodo(req, res) {
    const { todosId } = req.body;
    const { parameters } = req;

    const text = `DELETE FROM todos WHERE id IN (${parameters});`;
    const values = todosId;

    pool.query(text, values)
      .then(() => res.sendStatus(200))
      .catch(() => res.status(500).json({ message: 'There was an error while deleting your todo(s).' }));
  }
}

module.exports = TodoController;
