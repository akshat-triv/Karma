const notificationsModel = require('./../models/notificationsModel.js');

exports.getAllNotifications = async (req, res) => {
  const result = await notificationsModel.getAllNotifications();

  const statusCode = result.status === 'success' ? 200 : 500;

  res.status(statusCode).json(result);
};

exports.getNotifications = async (req, res) => {
  const { user } = req;

  const result = await notificationsModel.getNotificationsForUser(user.user_id);

  const statusCode = result.status === 'success' ? 200 : 500;

  res.status(statusCode).json(result);
};
