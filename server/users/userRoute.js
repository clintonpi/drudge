const express = require('express');
const path = require('path');
const UserController = require('./UserController');
const UserValidator = require('./UserValidator');

const {
  signupUser, loginUser, updateUser, deleteUser
} = UserController;

const {
  validateUsername,
  validateEmail,
  validatePassword,
  checkIfSignupDataIsUnique,
  checkIfUpdateDataIsUnique,
  validateLogin,
  validateProfileAuthentication
} = UserValidator;

const userRouter = express.Router();

userRouter.route('/signup')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'signup.html'));
  })
  .post(validateUsername, validateEmail, validatePassword, checkIfSignupDataIsUnique, signupUser);

userRouter.route('/login')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));
  })
  .post(validateLogin, loginUser);

userRouter.route('/profile')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'profile.html'));
  })
  .put(
    validateProfileAuthentication,
    validateUsername,
    validateEmail,
    validatePassword,
    checkIfUpdateDataIsUnique,
    updateUser
  )
  .delete(validateProfileAuthentication, deleteUser);

module.exports = userRouter;
