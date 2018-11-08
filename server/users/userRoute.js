const express = require('express');
const path = require('path');
const UserController = require('./UserController');
const UserValidator = require('./UserValidator');

const { signupUser, loginUser } = UserController;
const { validateSignup, validateLogin } = UserValidator;

const userRouter = express.Router();

userRouter.route('/signup')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'signup.html'));
  })
  .post(validateSignup, signupUser);

userRouter.route('/login')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));
  })
  .post(validateLogin, loginUser);

module.exports = userRouter;
