const { v4: uuidv4 } = require('uuid');

const projectsModel = require('./../models/projectsModel.js');
const usersModel = require('./../models/usersModel.js');
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
    return;
  }

  // Checking the authority of the user to update project data
  const { relation } = await usersProjectsRelModel.getUserProjectRelation(
    req.user.user_id,
    projectId
  );

  if (!relation || relation.user_type !== 'admin') {
    res.status(401).json({
      status: 'fail',
      message: 'You are not authorized to make this change in this project',
    });
    return;
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

  // Checking if project even exists.
  const { projectExists } = await projectsModel.doesProjectExists(projectId);

  if (!projectExists) {
    res
      .status(404)
      .json({ status: 'fail', message: 'No such project exists.' });
    return;
  }

  // Checking the authority of the user to update project data
  const { relation } = await usersProjectsRelModel.getUserProjectRelation(
    req.user.user_id,
    projectId
  );

  if (!relation || relation.user_type !== 'admin') {
    res.status(401).json({
      status: 'fail',
      message: 'You are not authorized to make this change in this project',
    });
    return;
  }

  const result = await projectsModel.deleteProject(projectId);

  const statusCode = result.status === 'success' ? 204 : 500;

  res.status(statusCode).json(result);
};

exports.addNewUserToProject = async (req, res) => {
  const {
    name: newUserName,
    email: newUserEmail,
    userType: newUserType,
    designation: newUserDesignation,
  } = req.body;
  const { projectId } = req.params;

  // Check if the project exists.
  const { projectExists } = await projectsModel.doesProjectExists(projectId);

  if (!projectExists) {
    res
      .status(404)
      .json({ status: 'fail', message: 'No such project exists.' });
    return;
  }

  // Checking the authority of the user to update project data
  const { relation } = await usersProjectsRelModel.getUserProjectRelation(
    req.user.user_id,
    projectId
  );

  if (!relation || relation.user_type !== 'admin') {
    res.status(401).json({
      status: 'fail',
      message: 'You are not authorized to add a new user to this project.',
    });
    return;
  }

  // Checking if the user already exists.
  const { user } = await usersModel.getUserWithEmail(newUserEmail);

  let newUserId;
  let responseObj = {
    status: 'success',
  };

  if (user) {
    newUserId = user.user_id;
    responseObj.message =
      'Added the user in your project, waiting for him to accept your invite.';
  } else {
    // Adding the new user to the users model
    newUserId = uuidv4();
    const newUserPassword = 'welcome';

    const result = await usersModel.createNewUser({
      name: newUserName,
      email: newUserPassword,
      userId: newUserId,
      password: newUserPassword,
    });

    if (result.status === 'fail') {
      res.status(500).json(result);
      return;
    }

    // Setting up a invite token
    const userJoiningExpiry = new Date(
      Date.now() + 72 * 60 * 60 * 1000
    ).toUTCString();

    const result3 = await usersModel.createPasswordResetToken(
      newUserEmail,
      userJoiningExpiry
    );

    if (result3.status === 'fail') {
      res.status(500).json(result2);
      return;
    }

    responseObj.message =
      'Added new user to the project successfully. Here is his/hers invite token. The user must reply to the invite within 72hr after that the invite will expire and the user gets deleted.';

    responseObj.token = result3.token;
  }

  // Adding the user in the project
  const result2 = await usersProjectsRelModel.insertNewRelation({
    userId: newUserId,
    projectId,
    designation: newUserDesignation,
    userType: newUserType,
  });

  if (result2.status === 'fail') {
    res.status(500).json(result2);
  }

  res.status(201).json(responseObj);
};

exports.getAllUsersInProject = async (req, res) => {
  const { projectId } = req.params;

  const result = await usersProjectsRelModel.getAllUsersInProject(projectId);

  const statusCode = result.status === 'success' ? 200 : 500;

  res.status(statusCode).json(result);
};
