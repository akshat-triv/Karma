const { v4: uuidv4 } = require('uuid');
const usersModel = require('../models/usersModel.js');

exports.createNewUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = uuidv4();

  const result = await usersModel.createNewUser({
    name,
    userId,
    email,
    password,
  });
  const statusCode = result.status === 'success' ? 201 : 500;
  res.status(statusCode).json(result);
};

exports.getAllUser = async (_, res) => {
  const result = await usersModel.getAllUsers();
  const statusCode = result.status === 'success' ? 200 : 500;
  res.status(statusCode).json(result);
};

exports.getUser = async (req, res) => {
  const userId = req.params.userId;
  const result = await usersModel.getUser(userId);

  const statusCode = result.status === 'success' ? 200 : 500;
  res.status(statusCode).json(result);
};

exports.updateUserData = async (req, res) => {
  const userId = req.params.userId;
  const { name, email, password } = req.body;

  const result = await usersModel.updateUser({ name, userId, email, password });

  const statusCode = result.status === 'success' ? 200 : 500;

  res.status(statusCode).json(result);
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  const result = await usersModel.deleteUser(userId);

  const statusCode = result.status === 'success' ? 204 : 500;

  res.status(statusCode).json(result);
};
