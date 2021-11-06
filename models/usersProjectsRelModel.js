const { Pool } = require('pg');

const pool = new Pool();

exports.insertNewRelation = async ({
  userId,
  projectId,
  designation,
  userType,
}) => {
  const queryString = `INSERT INTO users_projects_relations (user_id, project_id, designation, user_type) VALUES ($1, $2, $3, $4)`;

  const values = [userId, projectId, designation, userType];

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

//  SELECT u.name AS user_name, u.email, p.name AS project_name, upr.user_type FROM users as u JOIN users_projects_relations AS upr ON upr user_id = u.user_id JOIN projects as p ON upr.project_id = p.project_id;
