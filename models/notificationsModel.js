const { Pool } = require('pg');

const pool = new Pool();

exports.createNewNotification = async ({ userId, sentBy, message }) => {
  const queryString =
    'INSERT INTO notifications (user_id, sent_by, sent_at, message) VALUES ($1, $2, $3, $4)';

  const timeNow = new Date(Date.now()).toUTCString();

  const values = [userId, sentBy, timeNow, message];

  try {
    await pool.query(queryString, values);

    return {
      status: 'success',
      message: 'Inserted data successfully.',
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error.message,
    };
  }
};

exports.getAllNotifications = async () => {
  const queryString = 'SELECT * FROM notifications';

  try {
    const result = await pool.query(queryString);
    return {
      status: 'success',
      length: result.rows.length,
      notifications: result.rows,
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error.message,
    };
  }
};

exports.getNotificationsForUser = async (userId) => {
  const queryString = 'SELECT * FROM notifications WHERE user_id = $1';

  try {
    const result = await pool.query(queryString, [userId]);
    return {
      status: 'success',
      length: result.rows.length,
      notifications: result.rows,
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error.message,
    };
  }
};
