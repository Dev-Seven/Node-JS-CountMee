const router = require('express').Router()
const chatController = require('../controllers/chat.controller')
const validator = require('../validators/chat.validator')
const { setLanguage , isUserAuthenticated } = require('../middleware/auth.middleware')

router.post('/chat/priChat', isUserAuthenticated, validator.priChat, setLanguage, chatController.priChat)
router.post('/chat/allRecSendMsg', isUserAuthenticated, validator.allRecSendMsg, setLanguage, chatController.allRecSendMsg)
router.post('/chat/chattedUser', isUserAuthenticated, validator.chattedUser, setLanguage, chatController.chattedUser)
router.post('/chat/allChatNotification', isUserAuthenticated, validator.allChatNotification, setLanguage, chatController.allChatNotification)
router.post('/chat/chatNotificationDetail', isUserAuthenticated, validator.chatNotificationDetail, setLanguage, chatController.chatNotificationDetail)
router.post('/chat/rmvAllChatNotification', isUserAuthenticated, validator.rmvAllChatNotification, setLanguage, chatController.rmvAllChatNotification)
router.post('/chat/allDeletedChatNotification', isUserAuthenticated, setLanguage, chatController.allDeletedChatNotification)
router.post('/chat/deleteChatNotification', isUserAuthenticated, validator.deleteChatNotification, setLanguage, chatController.deleteChatNotification)
router.post('/chat/isChatNotificationRead', isUserAuthenticated, validator.isChatNotificationRead, setLanguage, chatController.isChatNotificationRead)

module.exports = router;
