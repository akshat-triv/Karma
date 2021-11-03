const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

  const result = await usersModel.getUserWithEmail(email);

  const user = result.data[0];

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
