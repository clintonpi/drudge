const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require('../db/index');
const sanitizeStr = require('../../utils');

const secretKey = process.env.SECRET_KEY;

/**
 * @class UserValidator
 * @classdesc Implements validation of user data, login and profile update and delete
 */
class UserValidator {
  /**
   * Validate user data
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateUserData(req, res, next) {
    const {
      username, email, password, password2
    } = req.body;

    if (!username || !email || !password || !password2) {
      return res.status(400).json({ message: 'Your request was incomplete.' });
    }

    if (typeof username !== 'string') {
      return res.status(400).json({ message: 'Your username was invalid.' });
    }

    const sanitizedUsername = sanitizeStr(username);
    const sanitizedUsernameLength = sanitizedUsername.length;
    if (sanitizedUsernameLength < 1 || sanitizedUsernameLength > 50) {
      return res.status(400).json({ message: 'Your username was invalid.' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Your email address was invalid.' });
    }

    const passwordLength = password.length;
    if (passwordLength < 8 || passwordLength > 4000 || password !== password2) {
      return res.status(400).json({ message: 'The password you chose to use was invalid.' });
    }

    const text = 'SELECT username, email FROM users WHERE username = $1 OR email = $2;';
    const values = [sanitizedUsername, email];

    pool.query(text, values)
      .then((result) => {
        const resultRowsLength = result.rows.length;

        if (resultRowsLength > 0) {
          const resultFirstRow = result.rows[0];
          const resultFirstRowUsername = resultFirstRow.username;
          const resultFirstRowEmail = resultFirstRow.email;

          if (resultRowsLength === 2
            || (resultFirstRowUsername === sanitizedUsername && resultFirstRowEmail === email)) {
            return res.status(400).json({ message: 'Users/a user with this username or/and email address already exists.' });
          }

          if (resultFirstRowUsername === sanitizedUsername) {
            return res.status(400).json({ message: 'A user with this username already exists.' });
          }

          if (resultFirstRowEmail === email) {
            return res.status(400).json({ message: 'A user with this email address already exists.' });
          }
        }
        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
  }

  /**
   * Validate user login
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateLogin(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Your request was incomplete' });

    const text = 'SELECT email, password FROM users WHERE email = $1;';
    const values = [email];

    pool.query(text, values)
      .then((result) => {
        if (result.rows.length === 0) return res.status(400).json({ message: 'This user does not exist.' });
        if (!bcrypt.compareSync(password, result.rows[0].password)) return res.status(400).json({ message: 'Your password was incorrect.' });
        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while logging you in.' }));
  }

  /**
   * Validate user profile
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateProfile(req, res, next) {
    let passkey;

    switch (req.method) {
      case 'DELETE':
        passkey = req.body.password;
        break;
      default:
        passkey = req.body.oldPassword;
        break;
    }

    const { token } = req.headers;

    if (!passkey) return res.status(400).json({ message: 'Your request was incomplete.' });
    if (!token) return res.status(403).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(403).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));

      const text = 'SELECT password FROM users WHERE id = $1;';
      const values = [user.id];

      pool.query(text, values)
        .then((result) => {
          if (result.rows.length === 0) return res.status(400).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));
          if (!bcrypt.compareSync(passkey, result.rows[0].password)) return res.status(400).json({ message: 'Your password was incorrect.' });
          return next();
        })
        .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
    });
  }
}

module.exports = UserValidator;
