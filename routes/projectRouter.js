const router = require('express').Router();

const {
  createNewProject,
  getAllProjects,
  getProjectWithProjectId,
  updateProjectData,
  deleteProject,
} = require('./../controllers/projectController.js');

const { protect } = require('./../controllers/authController.js');

router.route('/').post(protect, createNewProject).get(getAllProjects);

router
  .route('/:projectId')
  .get(getProjectWithProjectId)
  .patch(protect, updateProjectData)
  .delete(protect, deleteProject);

module.exports = router;
