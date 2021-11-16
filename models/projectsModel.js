const { Pool } = require('pg');

const pool = new Pool();

exports.createNewProject = async (projectInfo) => {
  const timeNow = new Date(Date.now()).toUTCString();
  const { name, description, projectId, createdBy } = projectInfo;

  const queryString = `INSERT INTO projects (name, description, project_id, created_by, created_at) VALUES ($1, $2, $3, $4, $5)`;

  const values = [name, description, projectId, createdBy];

  try {
    await pool.query(queryString, values);
    return {
      status: 'success',
      message: 'Project created successfully.',
      projectInfo: { ...projectInfo, createdAt: timeNow },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error.message,
    };
  }
};

exports.doesProjectExists = async (projectId) => {
  const queryString = `SELECT name FROM projects WHERE project_id = $1`;

  try {
    const result = await pool.query(queryString, [projectId]);
    return {
      status: 'success',
      message: 'Query run successfully.',
      projectName: result.rows[0].name,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error.message,
    };
  }
};

exports.getAllProjects = async () => {
  const queryString = 'SELECT * FROM projects';

  try {
    const result = await pool.query(queryString);
    return {
      status: 'success',
      length: result.rows.length,
      projects: result.rows,
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.getProjectWithProjectId = async (projectId) => {
  const queryString = `SELECT * FROM projects WHERE project_id = $1`;

  try {
    const result = await pool.query(queryString);

    return {
      status: 'success',
      project: result.rows[0],
      message: 'Data fetched successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.updateProjectData = async (projectData) => {
  const updateQuery = [];
  const values = [];

  if (projectData.name) {
    values.push(projectData.name);
    updateQuery.push(`name = $${values.length}`);
  }
  if (projectData.description) {
    values.push(projectData.description);
    updateQuery.push(`description = $${values.length}`);
  }

  values.push(projectData.projectId);

  const queryString = `UPDATE projects SET ${updateQuery.join(
    ','
  )} WHERE project_id = $${values.length}`;

  try {
    await pool.query(queryString, values);

    return { status: 'success', message: 'Updated successfully' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.deleteProject = async (projectId) => {
  const queryString = `DELETE FROM projects WHERE project_id = $1`;

  try {
    const res = await pool.query(queryString, [projectId]);
    return {
      status: 'success',
      message: 'Deleted project successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
