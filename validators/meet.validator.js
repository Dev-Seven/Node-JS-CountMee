const { body } = require('express-validator')

const requestForZoomMeet = [
    body('eventId').not().isEmpty(),
    // body('topic').not().isEmpty(),
    body('schedTime').not().isEmpty(),
    body('requestedUser').not().isEmpty(),
    body('reqAcceptUser').not().isEmpty()
]

const editReqForZoomMeet = [
    body('_id').not().isEmpty(),
]

const reqAcceptForZoomMeet = [
    body('_id').not().isEmpty(),
]

const reqCancellForZoomMeet = [
    body('_id').not().isEmpty(),
]

const joinSchedZoomMeeting = [
    body('_id').not().isEmpty(),
]

const allReqZoomMeetByEvent = [
    body('eventId').not().isEmpty(),
]

const allReqZoomMeetForUser = [
    // body('requestedUserId').not().isEmpty(),
]

const allReqAccepZoomMeetForUser = [
    body('reqAcceptUserId').not().isEmpty(),
]

const updZmKeys = [
    body('_id').not().isEmpty(),
]

const zmHdBySa = [
    body('superAdminId').not().isEmpty(),
    body('_id').not().isEmpty(),
]
 

module.exports = {
    requestForZoomMeet,
    editReqForZoomMeet,
    reqAcceptForZoomMeet,
    reqCancellForZoomMeet,
    joinSchedZoomMeeting,
    allReqZoomMeetByEvent,
    allReqZoomMeetForUser,
    allReqAccepZoomMeetForUser,
    updZmKeys,
    zmHdBySa
}
