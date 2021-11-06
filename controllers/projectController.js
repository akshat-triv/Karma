const { v4: uuidv4 } = require('uuid');

const projectsModel = require('./../models/projectsModel.js');
const usersProjectsRelModel = require('./../models/usersProjectsRelModel.js');

exports.createNewProject = async (req, res) => {
  const { name, description } = req.body;
  const createdBy = req.user.user_id;
  const projectId = uuidv4();

  const result = await projectsModel.createNewProject({
    name,
    description,
    createdBy,
    projectId,
  });

  const result2 = await usersProjectsRelModel.insertNewRelation({
    userId: createdBy,
    projectId,
    designation: 'creater',
    userType: 'admin',
  });

  const statusCode =
    result.status === 'success' && result2.status === 'success' ? 201 : 500;

  res.status(statusCode).json(result);
};

exports.getAllProjects = async (_, res) => {
  const result = await projectsModel.getAllProjects();
  const statusCode = result.status === 'success' ? 200 : 500;
  res.status(statusCode).json(result);
};

exports.getProjectWithProjectId = async (req, res) => {
  const result = await projectsModel.getProjectWithProjectId(
    req.params.projectId
  );

  const statusCode = result.status === 'success' ? 200 : 500;

  if (!result.project) {
    res
      .status(404)
      .json({ status: 'fail', message: 'No such project exists.' });
    return;
  }

  res.status(statusCode).json(result);
};

exports.updateProjectData = async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const { projectExists } = await projectsModel.doesProjectExists(projectId);

  if (!projectExists) {
    res
      .status(404)
      .json({ status: 'fail', message: 'No such project exists.' });
  }

  const result = await projectsModel.updateProjectData({
    name,
    description,
    projectId,
  });

  const statusCode = result.status === 'success' ? 200 : 500;

  res.status(statusCode).json(result);
};

exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  const result = await projectsModel.deleteProject(projectId);

  const statusCode = result.status === 'success' ? 204 : 500;

  res.status(statusCode).json(result);
};
