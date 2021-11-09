const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool();

exports.createNewUser = async (userData) => {
  const { name, userId, email, password } = userData;

  const hashedPassword = await bcrypt.hash(password, 12);

  const queryString = `INSERT INTO users (name, user_id, email, password, password_changed_at) VALUES ($1, $2, $3, $4, $5)`;

  const values = [
    name,
    userId,
    email,
    hashedPassword,
    new Date(Date.now()).toUTCString(),
  ];

  try {
    await pool.query(queryString, values);

    return { status: 'success', message: 'Created a new user successfully.' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.updateUser = async (userData) => {
  const updateQuery = [];
  const values = [];

  if (userData.name) {
    values.push(userData.name);
    updateQuery.push(`name = $${values.length}`);
  }
  if (userData.email) {
    values.push(userData.email);
    updateQuery.push(`email = $${values.length}`);
  }

  values.push(userData.userId);

  const queryString = `UPDATE users SET ${updateQuery.join(
    ','
  )} WHERE user_id = $${values.length}`;

  try {
    await pool.query(queryString, values);

    return { status: 'success', message: 'Updated successfully' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getAllUsers = async () => {
  const queryString = 'SELECT * FROM users';

  try {
    const result = await pool.query(queryString);
    return {
      status: 'success',
      length: result.rows.length,
      users: result.rows,
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.deleteUser = async (userdId) => {
  const queryString = `DELETE FROM users WHERE user_id = $1`;

  try {
    await pool.query(queryString, [userdId]);
    return {
      status: 'success',
      message: 'Deleted user successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getUserWithUserId = async (userId) => {
  const queryString = `SELECT * FROM users WHERE user_id = $1`;

  try {
    const result = await pool.query(queryString, [userId]);
    return {
      status: 'success',
      user: result.rows[0],
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getUserWithEmail = async (userEmail) => {
  const queryString = `SELECT * FROM users WHERE email = $1`;

  try {
    const result = await pool.query(queryString, [userEmail]);
    return {
      status: 'success',
      user: result.rows[0],
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getUserWithResetToken = async (resetToken) => {
  const timeNow = new Date(Date.now()).toUTCString();
  const queryString = `SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > $2`;

  try {
    const result = await pool.query(queryString, [resetToken, timeNow]);
    return {
      status: 'success',
      user: result.rows[0],
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.checkPasswordChanged = async (userId, jwtIssuiedAt) => {
  const queryString = `SELECT password_changed_at <= $1 AS isvalid  FROM users WHERE user_id = $2`;

  try {
    const result = await pool.query(queryString, [jwtIssuiedAt, userId]);

    return {
      status: 'success',
      result: result.rows[0],
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.createPasswordResetToken = async (email, tokenExpiry = undefined) => {
  const token = crypto.randomBytes(32).toString('hex');

  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  if (!tokenExpiry)
    tokenExpiry = new Date(Date.now() + 10 * 60 * 1000).toUTCString();

  const updateQuery = `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3`;

  try {
    await pool.query(updateQuery, [encryptedToken, tokenExpiry, email]);

    return {
      status: 'success',
      message: 'Set reset token successfully.',
      token,
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.updatePassword = async (password, userId) => {
  const timeNow = new Date(Date.now()).toUTCString();

  const hashedPassword = await bcrypt.hash(password, 12);

  const updateQuery = `UPDATE users SET password = $1, password_changed_at = $2, password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = $3`;

  try {
    await pool.query(updateQuery, [hashedPassword, timeNow, userId]);

    return {
      status: 'success',
      message: 'Updated password successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
