const router = require('express').Router()
const notificationController = require('../controllers/notification.controller')
const validator = require('../validators/notification.validator')
const { setLanguage , isUserAuthenticated } = require('../middleware/auth.middleware')
const  upload  = require('../middleware/upload.middleware')

router.post('/notification/allNotification', isUserAuthenticated, setLanguage, notificationController.allNotification)
router.post('/notification/notificationDetail', isUserAuthenticated, validator.notificationDetail, setLanguage, notificationController.notificationDetail)
router.post('/notification/rmvAllNotification', isUserAuthenticated, setLanguage, notificationController.rmvAllNotification)
router.post('/notification/rmvNotificationToList', isUserAuthenticated, validator.rmvNotificationToList, setLanguage, notificationController.rmvNotificationToList)
router.post('/notification/allDeletedNotification', isUserAuthenticated, setLanguage, notificationController.allDeletedNotification)
router.post('/notification/deleteNotification', isUserAuthenticated, validator.deleteNotification, setLanguage, notificationController.deleteNotification)

module.exports = router;
