const router = require('express').Router()
const meetController = require('../controllers/meet.controller')
const validator = require('../validators/meet.validator')
const { setLanguage , isUserAuthenticated } = require('../middleware/auth.middleware')

router.post('/meet/requestForZoomMeet', isUserAuthenticated, validator.requestForZoomMeet, setLanguage, meetController.requestForZoomMeet)
router.post('/meet/editReqForZoomMeet', isUserAuthenticated, validator.editReqForZoomMeet, setLanguage, meetController.editReqForZoomMeet)
router.post('/meet/reqAcceptForZoomMeet', isUserAuthenticated, validator.reqAcceptForZoomMeet, setLanguage, meetController.reqAcceptForZoomMeet)
router.post('/meet/reqCancellForZoomMeet', isUserAuthenticated, validator.reqCancellForZoomMeet, setLanguage, meetController.reqCancellForZoomMeet)
router.post('/meet/joinSchedZoomMeeting', isUserAuthenticated, validator.joinSchedZoomMeeting, setLanguage, meetController.joinSchedZoomMeeting)
router.post('/meet/allReqZoomMeetByEvent', isUserAuthenticated, validator.allReqZoomMeetByEvent, setLanguage, meetController.allReqZoomMeetByEvent)
router.post('/meet/allReqZoomMeetForUser', isUserAuthenticated, validator.allReqZoomMeetForUser, setLanguage, meetController.allReqZoomMeetForUser)
router.post('/meet/allReqAccepZoomMeetForUser', isUserAuthenticated, validator.allReqAccepZoomMeetForUser, setLanguage, meetController.allReqAccepZoomMeetForUser)
router.post('/meet/zmKyys', isUserAuthenticated, setLanguage, meetController.zmKyys)
router.post('/meet/updZmKeys', isUserAuthenticated, validator.updZmKeys, setLanguage, meetController.updZmKeys)
router.post('/meet/zmHdBySa', isUserAuthenticated, validator.zmHdBySa, setLanguage, meetController.zmHdBySa)




module.exports = router;
