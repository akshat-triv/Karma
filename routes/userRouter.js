const router = require('express').Router();

const {
  createNewUser,
  getAllUser,
  getUser,
  updateUserData,
  deleteUser,
  updateMe,
} = require('../controllers/userController.js');

const {
  signup,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController.js');

router.post('/signup', signup);

router.post('/login', login);

router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);

router.post('/resetPassword/:resetToken', resetPassword);

router.post('/updatePassword', protect, updatePassword);

router.post('/updateMe', protect, updateMe);

router.route('/').get(getAllUser).post(createNewUser);

router
  .route('/:userId')
  .get(getUser)
  .patch(protect, updateUserData)
  .delete(deleteUser);

module.exports = router;
