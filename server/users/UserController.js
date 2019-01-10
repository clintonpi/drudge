const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const pool = require('../db/index.js');

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
    const { sanitizedUsername, sanitizedEmail } = req;
    const { password } = req.body;
    const hashPassword = bcrypt.hashSync(password, 10);

    const text = 'INSERT INTO users(id, username, email, password) VALUES($1, $2, $3, $4) RETURNING id;';
    const values = [uuidv1(), sanitizedUsername, sanitizedEmail, hashPassword];

    pool.query(text, values)
      .then((result) => {
        const user = result.rows[0];
        const username = sanitizedUsername;
        const email = sanitizedEmail;

        const token = jwt.sign({
          id: user.id,
          username,
          email
        }, secretKey);

        return res.status(201).json({
          token,
          user: {
            username,
            email
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
    const { id, username, sanitizedEmail } = req;
    const email = sanitizedEmail;

    const token = jwt.sign({
      id,
      username,
      email
    }, secretKey);

    return res.status(200).json({
      token,
      user: {
        username,
        email
      }
    });
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
    const { password } = req.body;
    const { sanitizedUsername, sanitizedEmail, userId } = req;

    let text, values;

    if (password) {
      text = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4;';
      values = [sanitizedUsername, sanitizedEmail, bcrypt.hashSync(password, 10), userId];
    } else {
      text = 'UPDATE users SET username = $1, email = $2 WHERE id = $3;';
      values = [sanitizedUsername, sanitizedEmail, userId];
    }

    pool.query(text, values)
      .then(() => {
        const username = sanitizedUsername;
        const email = sanitizedEmail;

        const token = jwt.sign({
          id: userId,
          username,
          email
        }, secretKey);

        return res.status(201).json({
          token,
          user: {
            username,
            email
          }
        });
      })
      .catch(() => res.status(500).json({ message: 'There was an error while updating your profile.' }));
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
    const { userId } = req;

    const text = 'DELETE FROM users WHERE id = $1;';
    const values = [userId];

    pool.query(text, values)
      .then(() => res.status(200).json({ message: 'Your profile has been successfully deleted.' }))
      .catch(() => res.status(500).json({ message: 'There was an error while deleting your profile.' }));
  }
}

module.exports = UserController;
