const { body } = require('express-validator')

const priChat = [
    body('eventId').not().isEmpty(),
    body('senderId').not().isEmpty(),
    body('receiverId').not().isEmpty(),
]

const allRecSendMsg = [
    body('eventId').not().isEmpty(),
    body('chatUserDetails').not().isEmpty(),
]

const chattedUser = [
    body('eventId').not().isEmpty(),
    // body('chatUserDetails').not().isEmpty(),
]

const allChatNotification = [
    body('eventId').not().isEmpty(),
    body('receiverId').not().isEmpty(),
]

const chatNotificationDetail = [
    body('notificationId').not().isEmpty(),
]

const rmvAllChatNotification = [
    body('eventId').not().isEmpty(),
    body('receiverId').not().isEmpty()
]

const deleteChatNotification = [
    body('notificationId').not().isEmpty(),
]

const isChatNotificationRead = [
    body('eventId').not().isEmpty(),
    body('chatNotificationUser').not().isEmpty(),
]

module.exports = {
    priChat,
    allRecSendMsg,
    chattedUser,
    allChatNotification,
    chatNotificationDetail,
    rmvAllChatNotification,
    deleteChatNotification,
    isChatNotificationRead
}
