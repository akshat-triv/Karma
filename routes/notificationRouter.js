const { Router } = require('express');

const { protect } = require('./../controllers/authController.js');
const {
  getAllNotifications,
  getNotifications,
} = require('./../controllers/notificationController.js');

const router = new Router();

router.route('/').get(getAllNotifications);
router.route('/getMyNotifications').get(protect, getNotifications);

module.exports = router;
