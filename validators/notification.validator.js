const { body } = require('express-validator')

const notificationDetail = [
  body('notificationId').not().isEmpty()
]

const rmvNotificationToList = [
  body('notificationId').not().isEmpty()
]

const deleteNotification = [
  body('superAdminId').not().isEmpty(),
  body('notificationId').not().isEmpty()
]

module.exports = {
  notificationDetail,
  rmvNotificationToList,
  deleteNotification
}
