const express = require('express');
const path = require('path');
const UserController = require('./UserController');
const UserValidator = require('./UserValidator');

const { signupUser } = UserController;
const { validateSignup } = UserValidator;

const userRouter = express.Router();

userRouter.route('/signup')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'signup.html'));
  })
  .post(validateSignup, signupUser);

module.exports = userRouter;
