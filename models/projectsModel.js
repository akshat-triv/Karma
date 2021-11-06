const { Pool } = require('pg');

const pool = new Pool();

exports.createNewProject = async (projectInfo) => {
  const timeNow = new Date(Date.now()).toUTCString();
  const { name, description, projectId, createdBy } = projectInfo;

  const queryString = `INSERT INTO projects (name, description, project_id, created_by, created_at) VALUES ('${name}', '${description}', '${projectId}', '${createdBy}', '${timeNow}')`;

  try {
    await pool.query(queryString);
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
  const queryString = `SELECT COUNT(*) > 0 AS projectexists FROM projects WHERE project_id = '${projectId}'`;

  try {
    const result = await pool.query(queryString);
    return {
      status: 'success',
      message: 'Query run successfully.',
      projectExists: result.rows[0].projectexists,
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
  const queryString = `SELECT * FROM projects WHERE project_id = '${projectId}'`;

  try {
    const result = await pool.query(queryString);

    console.log(result);

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

  if (projectData.name) {
    updateQuery.push(`name = '${projectData.name}'`);
  }
  if (projectData.description) {
    updateQuery.push(`description = '${projectData.description}'`);
  }

  const queryString = `UPDATE projects SET ${updateQuery.join(
    ','
  )} WHERE project_id = '${projectData.projectId}'`;

  try {
    await pool.query(queryString);

    return { status: 'success', message: 'Updated successfully' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

exports.deleteProject = async (projectId) => {
  const queryString = `DELETE FROM projects WHERE project_id = '${projectId}'`;

  try {
    const res = await pool.query(queryString);
    console.log(res);
    return {
      status: 'success',
      message: 'Deleted project successfully.',
    };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
