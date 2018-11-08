const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const pool = require('../db/index.js');
const sanitizeStr = require('../../utils');

/**
 * @class UserController
 * @classdesc Implements user sign up
 */
class UserController {
  /**
   * Signs up a user
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @return {object} token or message
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
        }, process.env.SECRET_KEY);

        return res.status(201).json({ token });
      })
      .catch(() => res.status(500).json({ message: 'There was an error while processing your registration.' }));
  }
}

module.exports = UserController;
