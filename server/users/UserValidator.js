const isEmail = require('validator/lib/isEmail');
const pool = require('../db/index');
const sanitizeStr = require('../../utils');

/**
 * @class UserValidator
 * @classdesc Implements validation of user signup
 */
class UserValidator {
  /**
   * Validate user signup
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateSignup(req, res, next) {
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
            return res.status(400).json({ message: 'Users/a user with this username and email address already exists.' });
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
      .catch(() => res.status(500).json({ message: 'There was an error while processing your registration.' }));
  }
}

module.exports = UserValidator;
