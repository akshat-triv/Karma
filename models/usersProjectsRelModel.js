const { Pool } = require('pg');

const pool = new Pool();

exports.insertNewRelation = async ({
  userId,
  projectId,
  designation,
  userType,
  active = false,
}) => {
  const queryString = `INSERT INTO users_projects_relations (user_id, project_id, designation, user_type, active) VALUES ($1, $2, $3, $4, $5)`;

  const values = [userId, projectId, designation, userType, active];

  try {
    await pool.query(queryString, values);

    return {
      status: 'success',
      message: 'Relation inserted successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getUserProjectRelation = async (userId, projectId) => {
  const queryString =
    'SELECT * FROM users_projects_relations WHERE user_id = $1 AND project_id = $2';

  try {
    const res = await pool.query(queryString, [userId, projectId]);
    if (res.rowCount > 0)
      return {
        status: 'success',
        relation: res.rows[0],
        message: 'Relation found successfully.',
      };
    else
      return {
        status: 'fail',
        message: 'User is not related to the given project.',
      };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getAllUsersInProject = async (projectId) => {
  const queryString =
    'SELECT u.name AS user_name, p.name AS project_name, upr.designation , upr.user_type FROM users as u JOIN users_projects_relations AS upr ON upr.user_id = u.user_id JOIN projects as p ON upr.project_id = p.project_id WHERE upr.project_id = $1';

  try {
    const result = await pool.query(queryString, [projectId]);
    return {
      status: 'success',
      message: 'Query ran successfully',
      users: result.rows,
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

//  SELECT u.name AS user_name, u.email, p.name AS project_name, upr.user_type FROM users as u JOIN users_projects_relations AS upr ON upr user_id = u.user_id JOIN projects as p ON upr.project_id = p.project_id;
