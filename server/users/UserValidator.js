const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/index');
const sanitizeStr = require('../../utils');

const secretKey = process.env.SECRET_KEY;

/**
 * @class UserValidator
 * @classdesc Implements validation of username, email address, password,
 * login and profile update and delete
 */
class UserValidator {
  /**
   * Validate username
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateUsername(req, res, next) {
    const { username } = req.body;

    if (!username) {
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

    req.sanitizedUsername = sanitizedUsername;
    return next();
  }

  /**
   * Validate email
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Your request was incomplete.' });
    }

    const sanitizedEmail = email.trim();
    if (!isEmail(sanitizedEmail)) {
      return res.status(400).json({ message: 'Your email address was invalid.' });
    }

    req.sanitizedEmail = sanitizedEmail;
    return next();
  }

  /**
   * Validate password
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validatePassword(req, res, next) {
    const { password, password2 } = req.body;

    if (!password && !password2 && req.method === 'PUT') {
      return next();
    }

    if (!password || !password2) {
      return res.status(400).json({ message: 'Your request was incomplete.' });
    }

    const passwordLength = password.length;
    if (passwordLength < 8 || passwordLength > 4000 || password !== password2) {
      return res.status(400).json({ message: 'The password you chose to use was invalid.' });
    }

    return next();
  }

  /**
   *  Check if signup data is unique
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static checkIfSignupDataIsUnique(req, res, next) {
    const { sanitizedUsername, sanitizedEmail } = req;

    const text = 'SELECT username, email FROM users WHERE username = $1 OR email = $2;';
    const values = [sanitizedUsername, sanitizedEmail];

    pool.query(text, values)
      .then((result) => {
        const resultRowsLength = result.rows.length;

        if (resultRowsLength > 0) {
          const resultFirstRow = result.rows[0];
          const resultFirstRowUsername = resultFirstRow.username;
          const resultFirstRowEmail = resultFirstRow.email;

          if (resultRowsLength === 2
            || (resultFirstRowUsername === sanitizedUsername
            && resultFirstRowEmail === sanitizedEmail)) {
            return res.status(400).json({ message: 'Users/a user with this username or/and email address already exists.' });
          }

          if (resultFirstRowUsername === sanitizedUsername) {
            return res.status(400).json({ message: 'A user with this username already exists.' });
          }

          if (resultFirstRowEmail === sanitizedEmail) {
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

    const sanitizedEmail = email.trim();
    const text = 'SELECT id, username, email, password FROM users WHERE email = $1;';
    const values = [sanitizedEmail];

    pool.query(text, values)
      .then((result) => {
        const resultFirstRow = result.rows[0];

        if (result.rows.length === 0) return res.status(400).json({ message: 'This user does not exist.' });
        if (!bcrypt.compareSync(password, resultFirstRow.password)) return res.status(400).json({ message: 'Your password was incorrect.' });

        req.id = resultFirstRow.id;
        req.username = resultFirstRow.username;
        req.sanitizedEmail = sanitizedEmail;
        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while logging you in.' }));
  }

  /**
   * Validate user profile authentication
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static validateProfileAuthentication(req, res, next) {
    const passkey = req.method === 'DELETE' ? req.body.password : req.body.oldPassword;

    if (!passkey) return res.status(400).json({ message: 'Your request was incomplete.' });

    const { authorization } = req.headers; // headers are case-insensitve
    if (!authorization) return res.redirect('/login');

    // Header authorization will be sent as Authorization: Bearer <token>
    const token = authorization.split(' ')[1];
    if (!token) return res.redirect('/login');

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.redirect('/login');

      const userId = user.id;

      const text = 'SELECT password FROM users WHERE id = $1;';
      const values = [userId];

      pool.query(text, values)
        .then((result) => {
          if (result.rows.length === 0) return res.redirect('/login');
          if (!bcrypt.compareSync(passkey, result.rows[0].password)) return res.status(400).json({ message: 'Your password was incorrect.' });

          req.userId = userId;
          return next();
        })
        .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
    });
  }

  /**
   * Check if update data is unique
   *
   * @static
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {function} next - The next middleware
   * @return {object} message
   * @memberof UserValidator
   */
  static checkIfUpdateDataIsUnique(req, res, next) {
    const { sanitizedUsername, sanitizedEmail, userId } = req;

    const text = 'SELECT id, username, email FROM users WHERE username = $1 OR email = $2;';
    const values = [sanitizedUsername, sanitizedEmail];

    pool.query(text, values)
      .then((result) => {
        const resultRowsLength = result.rows.length;

        if (resultRowsLength > 0) {
          const resultFirstRow = result.rows[0];
          const resultFirstRowId = resultFirstRow.id;
          const resultFirstRowUsername = resultFirstRow.username;
          const resultFirstRowEmail = resultFirstRow.email;

          if (resultRowsLength === 2) {
            const resultSecondRow = result.rows[1];
            const resultSecondRowId = resultSecondRow.id;
            const resultSecondRowUsername = resultSecondRow.username;
            const resultSecondRowEmail = resultSecondRow.email;

            if (resultFirstRowId !== userId && resultSecondRowId !== userId) {
              return res.status(400).json({ message: 'A user with this username and email address already exists.' });
            }

            const alreadyExists = (data) => {
              const resultFirstRowData = data === 'username' ? resultFirstRowUsername : resultFirstRowEmail;
              const resultSecondRowData = data === 'username' ? resultSecondRowUsername : resultSecondRowEmail;
              const sanitizedData = data === 'username' ? sanitizedUsername : sanitizedEmail;

              if (((resultFirstRowData) === sanitizedData && resultFirstRowId !== userId)
              || (resultSecondRowData === sanitizedData && resultSecondRowId !== userId)) {
                return true;
              }
            };

            if (alreadyExists('username')) {
              return res.status(400).json({ message: 'A user with this username already exists.' });
            }

            if (alreadyExists('email')) {
              return res.status(400).json({ message: 'A user with this email address already exists.' });
            }
          }

          if (resultFirstRowUsername === sanitizedUsername
            && resultFirstRowEmail === sanitizedEmail
            && resultFirstRowId !== userId) {
            return res.status(400).json({ message: 'A user with this username and email address already exists.' });
          }
        }
        return next();
      })
      .catch(() => res.status(500).json({ message: 'There was an error while processing your request.' }));
  }
}

module.exports = UserValidator;
