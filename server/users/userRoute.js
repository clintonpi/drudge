const express = require('express');
const path = require('path');
const UserController = require('./UserController');
const UserValidator = require('./UserValidator');

const { signupUser, loginUser, updateUser } = UserController;
const { validateUserData, validateLogin, validateProfile } = UserValidator;

const userRouter = express.Router();

userRouter.route('/signup')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'signup.html'));
  })
  .post(validateUserData, signupUser);

userRouter.route('/login')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'login.html'));
  })
  .post(validateLogin, loginUser);

userRouter.route('/profile')
  .get((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'html', 'profile.html'));
  })
  .put(validateProfile, validateUserData, updateUser);

module.exports = userRouter;
