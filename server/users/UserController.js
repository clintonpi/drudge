const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const pool = require('../db/index.js');
const sanitizeStr = require('../../utils');

const secretKey = process.env.SECRET_KEY;

/**
 * @class UserController
 * @classdesc Implements user sign up, log in, profile update and delete
 */
class UserController {
  /**
   * Signs up a user
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @return {object} token and user or message
   * @memberof UserController
   */
  static signupUser(req, res) {
    const { username, email, password } = req.body;
    const sanitizedUsername = sanitizeStr(username);
    const hashPassword = bcrypt.hashSync(password, 10);

    const text = 'INSERT INTO users(id, username, email, password) VALUES($1, $2, $3, $4) RETURNING *;';
    const values = [uuidv1(), sanitizedUsername, email, hashPassword];

    pool.query(text, values)
      .then((result) => {
        const user = result.rows[0];

        const token = jwt.sign({
          id: user.id,
          username: user.username,
          email: user.email
        }, secretKey);

        return res.status(201).json({
          token,
          user: {
            username: user.username,
            email: user.email
          }
        });
      })
      .catch(() => res.status(500).json({ message: 'There was an error while processing your registration.' }));
  }

  /**
   * Logs in a user
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @return {object} token and user or message
   * @memberof UserController
   */
  static loginUser(req, res) {
    const { email } = req.body;

    const text = 'SELECT id, username, email FROM users WHERE email = $1;';
    const values = [email];

    pool.query(text, values)
      .then((result) => {
        const user = result.rows[0];

        const token = jwt.sign({
          id: user.id,
          username: user.username,
          email: user.email
        }, secretKey);

        return res.status(200).json({
          token,
          user: {
            username: user.username,
            email: user.email
          }
        });
      })
      .catch(() => res.status(500).json({ message: 'There was an error while logging you in.' }));
  }

  /**
   * Updates user profile
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @return {object} token and user or message
   * @memberof UserController
   */
  static updateUser(req, res) {
    const { username, email, password } = req.body;
    let { token } = req;
    jwt.verify(token, secretKey, (err, oldUser) => {
      if (err) return res.redirect('/login');

      const text = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *;';
      const values = [username, email, bcrypt.hashSync(password, 10), oldUser.id];

      pool.query(text, values)
        .then((result) => {
          const user = result.rows[0];

          token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email
          }, secretKey);

          return res.status(201).json({
            token,
            user: {
              username: user.username,
              email: user.email
            }
          });
        })
        .catch(() => res.status(500).json({ message: 'There was an error while updating your profile.' }));
    });
  }

  /**
   * Deletes a user
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @return {object} message
   * @memberof UserController
   */
  static deleteUser(req, res) {
    const { token } = req;
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.redirect('/login');

      const text = 'DELETE FROM users WHERE id = $1;';
      const values = [user.id];

      pool.query(text, values)
        .then(() => res.status(200).json({ message: 'Your profile has been successfully deleted.' }))
        .catch(() => res.status(500).json({ message: 'There was an error while deleting your profile.' }));
    });
  }
}

module.exports = UserController;
