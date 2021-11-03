const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
  if (userData.password) {
    updateQuery.push(
      `password = '${await bcrypt.hash(userData.password, 12)}'`
    );
    updateQuery.push(`password_changed_at = '${new Date().toUTCString()}'`);
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
      data: result.rows,
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
      data: result.rows,
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
      data: result.rows,
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
