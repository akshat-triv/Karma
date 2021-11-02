const router = require('express').Router();

const {
  createNewUser,
  getAllUser,
  getUser,
  updateUserData,
  deleteUser,
} = require('../controllers/userController.js');

router.route('/').get(getAllUser).post(createNewUser);

router.route('/:userId').get(getUser).patch(updateUserData).delete(deleteUser);

module.exports = router;
