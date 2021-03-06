const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const usersModel = require('./../models/usersModel.js');

const createToken = (userId) => {
  return JWT.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = (statusCode, message, userId, req, res) => {
  const token = createToken(userId);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('JWT', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: token,
    message,
  });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = uuidv4();

  const result = await usersModel.createNewUser({
    name,
    userId,
    email,
    password,
  });

  const statusCode = result.status === 'success' ? 201 : 500;

  if (statusCode === 201)
    sendToken(201, 'User created successfully.', userId, req, res);
  else res.status(statusCode).json(result);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { user } = await usersModel.getUserWithEmail(email);

  if (!user) {
    res
      .status(401)
      .json({ status: 'fail', message: 'Invalid email or password' });

    return;
  }

  const passwordCheck = await promisify(bcrypt.compare)(
    password,
    user.password
  );

  if (!passwordCheck) {
    res
      .status(401)
      .json({ status: 'fail', message: 'Invalid email or password' });

    return;
  }

  sendToken(200, 'User login successfully.', user.user_id, req, res);
};

exports.logout = (_, res) => {
  res.cookie('JWT', undefined, {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = async (req, res, next) => {
  // Checking if the token came in
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: 'fail', message: 'Please login or signup to access' });
  }

  //2) Verification of the Token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  const { user } = await usersModel.getUserWithUserId(decoded.userId);

  if (!user) {
    return res
      .status(401)
      .json({ status: 'fail', message: "User doesn't exist anymore" });
  }

  const jwtIssuiedAt = new Date(decoded.iat * 1000).toUTCString();

  const { result } = await usersModel.checkPasswordChanged(
    user.user_id,
    jwtIssuiedAt
  );

  if (!result.isvalid) {
    return res.status(401).json({
      status: 'fail',
      message: 'Password been changed recently, please login again.',
    });
  }

  req.user = user;
  next();
};

exports.forgotPassword = async (req, res) => {
  const { user } = await usersModel.getUserWithEmail(req.body.email);

  if (!user) {
    res.status(400).json({ status: 'fail', message: 'No such user exist.' });
    return;
  }

  const result = await usersModel.createPasswordResetToken(user.email);

  if (result.status !== 'success')
    res.status(400).json({ status: result.status, message: result.message });

  // Send the user an email for the token, for now just returning it in the response

  res.status(201).json(result);
};

exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const encryptedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const { user } = await usersModel.getUserWithResetToken(encryptedToken);

  if (!user) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid token. Token must have expired.',
    });
    return;
  }

  const result = await usersModel.updatePassword(password, user.user_id);

  if (result.status !== 'success') {
    res.status(500).json(result);
    return;
  }

  sendToken(200, 'Password updated successfully.', user.user_id, req, res);
};

exports.updatePassword = async (req, res) => {
  const { user } = req;
  const { passwordCurrent, passwordNew } = req.body;

  const passwordCheck = await promisify(bcrypt.compare)(
    passwordCurrent,
    user.password
  );

  if (!passwordCheck) {
    res.status(401).json({ status: 'fail', message: 'Incorrect password.' });
    return;
  }

  const result = await usersModel.updatePassword(passwordNew, user.user_id);

  if (result.status !== 'success') {
    res.status(500).json(result);
    return;
  }

  sendToken(200, 'Password updated successfully.', user.user_id, req, res);
};
