const router = require('express').Router();

const {
  createNewProject,
  getAllProjects,
  getProjectWithProjectId,
  updateProjectData,
  deleteProject,
  addNewUserToProject,
  getAllUsersInProject,
} = require('./../controllers/projectController.js');

const { protect } = require('./../controllers/authController.js');

router.post('/addNewUser/:projectId', protect, addNewUserToProject);

router.get('/getAllUsers/:projectId', getAllUsersInProject);

router.route('/').post(protect, createNewProject).get(getAllProjects);

router
  .route('/:projectId')
  .get(getProjectWithProjectId)
  .patch(protect, updateProjectData)
  .delete(protect, deleteProject);

module.exports = router;
