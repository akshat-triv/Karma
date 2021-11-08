const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool();

exports.createNewUser = async (userData) => {
  const { name, userId, email, password } = userData;

  const hashedPassword = await bcrypt.hash(password, 12);

  const queryString = `INSERT INTO users (name, user_id, email, password, password_changed_at) VALUES ('${name}', '${userId}', '${email}', '${hashedPassword}', '${new Date().toUTCString()}')`;

  try {
    await pool.query(queryString);

    return { status: 'success', message: 'Created a new user successfully.' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.updateUser = async (userData) => {
  const updateQuery = [];

  if (userData.name) {
    updateQuery.push(`name = '${userData.name}'`);
  }
  if (userData.email) {
    updateQuery.push(`email = '${userData.email}'`);
  }

  const queryString = `UPDATE users SET ${updateQuery.join(
    ','
  )} WHERE user_id = '${userData.userId}'`;

  try {
    await pool.query(queryString);

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
  const queryString = `DELETE FROM users WHERE user_id = '${userdId}'`;

  try {
    await pool.query(queryString);
    return {
      status: 'success',
      message: 'Deleted user successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getUserWithUserId = async (userId) => {
  const queryString = `SELECT * FROM users WHERE user_id = '${userId}'`;

  try {
    const result = await pool.query(queryString);
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
  const queryString = `SELECT * FROM users WHERE email = '${userEmail}'`;

  try {
    const result = await pool.query(queryString);
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
  const queryString = `SELECT * FROM users WHERE password_reset_token = '${resetToken}' AND password_reset_expires > '${timeNow}'`;

  try {
    const result = await pool.query(queryString);
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
  const queryString = `SELECT password_changed_at <= '${jwtIssuiedAt}' AS isvalid  FROM users WHERE user_id = '${userId}'`;

  try {
    const result = await pool.query(queryString);

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

  const updateQuery = `UPDATE users SET password_reset_token = '${encryptedToken}', password_reset_expires = '${tokenExpiry}' WHERE email = '${email}'`;

  try {
    await pool.query(updateQuery);

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

  const updateQuery = `UPDATE users SET password = '${hashedPassword}', password_changed_at = '${timeNow}', password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = '${userId}'`;

  try {
    await pool.query(updateQuery);

    return {
      status: 'success',
      message: 'Updated password successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
