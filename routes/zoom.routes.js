const router = require('express').Router()
const zoomController = require('../controllers/zoom.controller')
const validator = require('../validators/zoom.validators')
const { setLanguage , isUserAuthenticated } = require('../middleware/auth.middleware')

router.post('/zoom/allStoredKey', isUserAuthenticated, setLanguage, zoomController.allStoredKey)
router.post('/zoom/linkGenForMeet', isUserAuthenticated, validator.linkGenForMeet, setLanguage, zoomController.linkGenForMeet)
router.post('/zoom/linkGenForLounge', isUserAuthenticated, validator.linkGenForLounge, setLanguage, zoomController.linkGenForLounge)
router.post('/zoom/linkExpireForMeet', isUserAuthenticated, validator.linkExpireForMeet, setLanguage, zoomController.linkExpireForMeet)
router.post('/zoom/allActiveLinkForLounge', isUserAuthenticated, setLanguage, zoomController.allActiveLinkForLounge)
router.post('/zoom/allActiveLinkForMeet', isUserAuthenticated, setLanguage, zoomController.allActiveLinkForMeet)
router.post('/zoom/linkShorten', isUserAuthenticated, setLanguage, zoomController.linkShorten)
router.post('/zoom/addZoomUrl', isUserAuthenticated, setLanguage, zoomController.addZoomUrl)
router.post('/zoom/zoomUserInfo', isUserAuthenticated, validator.zoomUserInfo, setLanguage, zoomController.zoomUserInfo);
router.post('/zoom/createZoomMeeting', isUserAuthenticated, validator.createZoomMeeting, setLanguage, zoomController.createZoomMeeting);
router.post('/zoom/updateZoomMeeting', isUserAuthenticated, validator.updateZoomMeeting, setLanguage, zoomController.updateZoomMeeting);
router.post('/zoom/meetingDetails', isUserAuthenticated, validator.meetingDetails, setLanguage, zoomController.meetingDetails);
router.post('/zoom/allZoomMeetLink', isUserAuthenticated, setLanguage, zoomController.allZoomMeetLink);
router.post('/zoom/allZoomMeetLinkForLounge', isUserAuthenticated, setLanguage, zoomController.allZoomMeetLinkForLounge);
router.post('/zoom/allZoomMeetLinkForSchedule', isUserAuthenticated, setLanguage, zoomController.allZoomMeetLinkForSchedule);
router.post('/zoom/zoomMeetLeaveForLounge', isUserAuthenticated, setLanguage, zoomController.zoomMeetLeaveForLounge);
router.post('/zoom/deleteZoomMeeting', isUserAuthenticated, validator.deleteZoomMeeting, setLanguage, zoomController.deleteZoomMeeting);


module.exports = router;
