const { body } = require('express-validator')

const linkGenForMeet = [
    body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const linkGenForLounge = [
    body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const linkExpireForMeet = [
    body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const zoomUserInfo = [
    body('token').not().isEmpty(),
    body('email').not().isEmpty()
]

const createZoomMeeting = [
    body('token').not().isEmpty(),
    body('email').not().isEmpty(),
    body('topic').not().isEmpty(),
    //body('start_time').not().isEmpty(),
    //body('duration').not().isEmpty(),
    body('timezone').not().isEmpty(),
    body('password').not().isEmpty(),
    body('agenda').not().isEmpty(),
]

const updateZoomMeeting = [
    body('token').not().isEmpty(),
    body('meetingId').not().isEmpty()
]

const meetingDetails = [
    body('token').not().isEmpty(),
    body('meetingId').not().isEmpty()
]

const deleteZoomMeeting = [
    body('token').not().isEmpty(),
    body('meetingId').not().isEmpty()
] 

module.exports = {
    linkGenForMeet,
    linkGenForLounge,
    linkExpireForMeet,
    zoomUserInfo,
    createZoomMeeting,
    meetingDetails,
    updateZoomMeeting,
    deleteZoomMeeting
}
