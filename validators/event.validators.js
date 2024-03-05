const { body } = require('express-validator')

const createEvent = [
  body('organizationId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('starts_at').not().isEmpty(),
  body('ends_at').not().isEmpty(),
  body('custom_url').not().isEmpty().matches(/^[a-zA-Z0-9. :/_-]+$/).withMessage('url cannot accept any special charactar'),
]

const eventById = [
  body('id').not().isEmpty()
]

const eventByCode = [
  body('code').not().isEmpty()
]

const eventDetailsByCode = [
  body('custom_url').not().isEmpty()
]

const eventDetail = [
  body('eventId').not().isEmpty()
]

const eventsByOrg = [
  body('organizationId').not().isEmpty(),
]

const approveEvent = [
  body('eventId').not().isEmpty(),
  body('superAdminId').not().isEmpty(),
]

const declineEvent = [
  body('eventId').not().isEmpty(),
  body('superAdminId').not().isEmpty(),
]

const deleteEventByOrg = [
  body('eventId').not().isEmpty(),
  body('organizationId').not().isEmpty(),
]

const deleteEvent = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const deleteEventBySuperAdmin = [
  body('superAdminId').not().isEmpty(),
  body('eventId').not().isEmpty()
]

const eventSdnDataHdBySa = [
  body('_id').not().isEmpty().withMessage('SuperAdmin id is required.'),
  body('eventId').not().isEmpty()
]

const editEvent = [
  body('event_id').not().isEmpty(),
  body('_id').not().isEmpty().withMessage('Organization id is required.'),
  // body('name').not().isEmpty(),
  // body('starts_at').not().isEmpty(),
  // body('ends_at').not().isEmpty()
]

const addSpeaker = [
  body('eventId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('description').not().isEmpty(),
  body('phone_number').not().isEmpty(),
  body('address').not().isEmpty(),
  body('username_email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const addSponsor = [
  body('eventId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  // body('website').not().isEmpty(),
  body('description').not().isEmpty(),
  body('phone_number').not().isEmpty(),
  body('address').not().isEmpty(),
  body('sponsor_list').not().isEmpty().withMessage('Partner category is required.'),
  body('username_email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const editSpeaker = [
  body('speaker_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('username_email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const editSponsor = [
  body('sponsor_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('username_email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const deleteSpeaker = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const deleteSponsor = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const speakerDetail = [
  body('id').not().isEmpty()
]

const speakerByEvent = [
  body('eventId').not().isEmpty(),
]

const addSpeakerToFeature = [
  body('eventId').not().isEmpty(),
  body('speakerId').not().isEmpty()
]

const rmvSpeakerToFeature = [
  body('eventId').not().isEmpty(),
  body('speakerId').not().isEmpty()
]

const rmvAllTSpeakerToFeature = [
  body('eventId').not().isEmpty()
]

const sponsorDetail = [
  body('id').not().isEmpty()
]

const sponsorByEvent = [
  body('eventId').not().isEmpty(),
]

const addSponsorToFeature = [
  body('eventId').not().isEmpty(),
  body('sponsorId').not().isEmpty()
]

const rmvSponsorToFeature = [
  body('eventId').not().isEmpty(),
  body('sponsorId').not().isEmpty()
]

const rmvAllTSponsorToFeature = [
  body('eventId').not().isEmpty()
]

const sponsorByOrg = [
  body('organizationId').not().isEmpty(),
]

const addStage = [
  body('eventId').not().isEmpty(),
  body('title').not().isEmpty(),
  body('description').not().isEmpty(),
  // body('segment_backstage_link').not().isEmpty(),
  // body('streamename').not().isEmpty(),
  body('starts_at').not().isEmpty(),
  body('ends_at').not().isEmpty()
]

const editStage = [
  body('_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const stageDetail = [
  body('id').not().isEmpty()
]

const stageByEvent = [
  body('eventId').not().isEmpty(),
]

const isStageWatch = [
  body('_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const stageWatchUser = [
  body('eventId').not().isEmpty(),
]

const deleteStage = [
  // body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty()
]

const addPartner = [
  body('eventId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('description').not().isEmpty(),
  body('phone_number').not().isEmpty(),
  body('address').not().isEmpty(),
]

const editPartner = [
  body('partner_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const partnerDetail = [
  body('id').not().isEmpty()
]

const partnerByEvent = [
  body('eventId').not().isEmpty()
]

const deletePartner = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const addWelMsgForEvent = [
  body('eventId').not().isEmpty(),
  body('description').not().isEmpty(),
]

const addWelMsg = [
  body('eventId').not().isEmpty(),
  body('type').not().isEmpty(),
  body('message').not().isEmpty(),
]

const msgsByType = [
  body('type').not().isEmpty(),
]

const msgDetail = [
  body('id').not().isEmpty()
]

const deleteWelMsg = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const scheduleAgenda = [
  body('eventId').not().isEmpty(),
  body('session_type').not().isEmpty(),
  body('title').not().isEmpty(),
  body('description').not().isEmpty(),
  body('starts_at').not().isEmpty(),
  body('ends_at').not().isEmpty()
]

const editScheduleAgenda = [
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty()
]

const scheduledAgendaDetail = [
  body('id').not().isEmpty()
]

const scheduledAgendaByEvent = [
  body('eventId').not().isEmpty()
]

const scheduledNetworkByEvent = [
  body('eventId').not().isEmpty()
]

const sessionStageScheduledByEvent = [
  body('eventId').not().isEmpty()
]

const deleteScheduledAgenda = [
  // body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty()
]

const addExpoBooth = [
  body('eventId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('description').not().isEmpty(),
  body('address').not().isEmpty(),
  body('phone_number').not().isEmpty(),
  body('username_email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const editExpo = [
  body('expo_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('username_email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const expoBoothDetail = [
  body('id').not().isEmpty()
]

const deleteExpo = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const expoByEvent = [
  body('eventId').not().isEmpty()
]

const uploadCsv = [
  body('eventId').not().isEmpty()
]

const userRegForEve = [
  body('eventId').not().isEmpty(),
  body('first_name').not().isEmpty(),
  body('last_name').not().isEmpty(),
  body('country_name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('password').not().isEmpty(),
  //   body('password', 'Password must be including 1 upper case character, special character and alphanumeric.')
// .escape()
// .exists({checkFalsy: true})
// .isLength({min: 8, max:100})
// .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
]

const userLoginForEve = [
  body('eventId').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('password').not().isEmpty().isLength({ min: 8, max:20})
]

const editUserProfileForEve = [
  body('userID').not().isEmpty(),
  body('eventID').not().isEmpty()
]

const userChangePasswordForEve = [
  body('eventId').not().isEmpty(),
  body('userId').not().isEmpty(),
  body('oldPassword').not().isEmpty(),
  body('newPassword').not().isEmpty(),
]

const attendeesForEvent = [
  body('eventId').not().isEmpty()
]

const attendeesByCountry = [
  body('eventId').not().isEmpty(),
  body('country_name').not().isEmpty()
]

const addCustomField = [
  body('eventId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('lable').not().isEmpty(),
  body('input_type').not().isEmpty(),
  // body('placeholder').not().isEmpty()
]

const editCustomField = [
  body('customFieldId').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const customfieldByEvent = [
  body('eventId').not().isEmpty()
]

const customFieldDetail = [
  body('id').not().isEmpty()
]

const deleteCustomField = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const emailCredOrganization = [
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const postEventFeed = [
  body('eventId').not().isEmpty(),
  body('userId').not().isEmpty()
]

const editPostEventFeed = [
  body('eventFeed_id').not().isEmpty(),
]

const allFeedPost = [
  body('eventId').not().isEmpty(),
]

const myFeedPost = [
  body('eventId').not().isEmpty(),
  body('userId').not().isEmpty(),
]

const allPdfFeedPost = [
  body('eventId').not().isEmpty(),
]

const allImageFeedPost = [
  body('eventId').not().isEmpty(),
]

const allVideoFeedPost = [
  body('eventId').not().isEmpty(),
]

const postDetail = [
  body('id').not().isEmpty()
]

const eventFeedComment = [
  body('eventFeedPostId').not().isEmpty().withMessage('eventFeedPostId is required.'),
  body('eventId').not().isEmpty(),
  body('userId').not().isEmpty(),
]

const editEventFeedComment = [
  body('_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('userId').not().isEmpty(),
]

const commentOnFeedPost = [
  body('eventFeedPostId').not().isEmpty(),
]

const deleteFeedPost = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const deleteFeedPostComment = [
  body('userId').not().isEmpty(),
  body('id').not().isEmpty()
]

const addSession = [
  body('eventId').not().isEmpty(),
  body('title').not().isEmpty(),
  body('description').not().isEmpty(),
  // body('starts_at').not().isEmpty(),
  // body('ends_at').not().isEmpty(),
  // body('url').not().isEmpty(),
]

const editSession = [
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty(),
  // body('url').not().isEmpty().matches(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g).withMessage('url is not valid.'),
]

const sessionByEvent = [
  body('eventId').not().isEmpty()
]

const deleteSession = [
  // body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty()
]

const sessionDetail = [
  body('id').not().isEmpty()
]

const isSessionWatch = [
  body('_id').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const sessionWatchUser = [
  body('eventId').not().isEmpty(),
]

const addFeaSpeakerForSa = [
  body('superAdminId').not().isEmpty().withMessage('superAdminId is required.'),
  body('categoryName').not().isEmpty().withMessage('categoryName is required.'),
  body('sequence').not().isEmpty().withMessage('sequence is required.')
]

const editFeaSpeakerForSa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty().withMessage('category id is required.')
]

const feaSpeakerForSaDetail = [
  body('feaSpeakerId').not().isEmpty(),
]

const deleteFeaSpeakerForSa = [
  body('superAdminId').not().isEmpty(),
  body('feaSpeakerId').not().isEmpty()
]

const addFeaSponsorForSa = [
  body('superAdminId').not().isEmpty().withMessage('superAdminId is required.'),
  body('categoryName').not().isEmpty().withMessage('categoryName is required.'),
  body('sequence').not().isEmpty().withMessage('sequence is required.')
]

const editFeaSponsorForSa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty().withMessage('category id is required.')
]

const feaSponsorForSaDetail = [
  body('feaSponsorId').not().isEmpty(),
]

const deleteFeaSponsorForSa = [
  body('superAdminId').not().isEmpty(),
  body('feaSponsorId').not().isEmpty()
]

const speakerHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
]

const sponsorHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
]

const expoHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
]

const sessionHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const schedAgHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const stageHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const eventHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const eveFeedHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const eveFeedCmntHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const loungeHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const notificationHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const organizationHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const speCollHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const spoCollHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const zoomHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

module.exports = {
  createEvent,
  eventById,
  eventByCode,
  eventDetailsByCode,
  eventDetail,
  approveEvent,
  declineEvent,
  eventsByOrg,
  deleteEventByOrg,
  deleteEvent,
  deleteEventBySuperAdmin,
  eventSdnDataHdBySa,
  editEvent,
  addSpeaker,
  addSponsor,
  editSpeaker,
  editSponsor,
  deleteSpeaker,
  deleteSponsor,
  speakerDetail,
  speakerByEvent,
  addSpeakerToFeature,
  rmvSpeakerToFeature,
  rmvAllTSpeakerToFeature,
  sponsorDetail,
  sponsorByEvent,
  addSponsorToFeature,
  rmvSponsorToFeature,
  rmvAllTSponsorToFeature,
  sponsorByOrg,
  addStage,
  editStage,
  stageDetail,
  stageByEvent,
  isStageWatch,
  stageWatchUser,
  deleteStage,
  addPartner,
  editPartner,
  partnerDetail,
  partnerByEvent,
  deletePartner,
  addWelMsgForEvent,
  addWelMsg,
  msgsByType,
  msgDetail,
  deleteWelMsg,
  scheduleAgenda,
  editScheduleAgenda,
  scheduledAgendaDetail,
  scheduledAgendaByEvent,
  scheduledNetworkByEvent,
  sessionStageScheduledByEvent,
  deleteScheduledAgenda,
  addExpoBooth,
  editExpo,
  expoBoothDetail,
  deleteExpo,
  expoByEvent,
  uploadCsv,
  userRegForEve,
  userLoginForEve,
  editUserProfileForEve,
  userChangePasswordForEve,
  attendeesForEvent,
  attendeesByCountry,
  addCustomField,
  editCustomField,
  customfieldByEvent,
  customFieldDetail,
  deleteCustomField,
  emailCredOrganization,
  postEventFeed,
  editPostEventFeed,
  allFeedPost,
  myFeedPost,
  allPdfFeedPost,
  allImageFeedPost,
  allVideoFeedPost,
  postDetail,
  eventFeedComment,
  editEventFeedComment,
  commentOnFeedPost,
  deleteFeedPost,
  deleteFeedPostComment,
  addSession,
  editSession,
  sessionByEvent,
  sessionDetail,
  isSessionWatch,
  sessionWatchUser,
  deleteSession,
  addFeaSpeakerForSa,
  editFeaSpeakerForSa,
  feaSpeakerForSaDetail,
  deleteFeaSpeakerForSa,
  addFeaSponsorForSa,
  editFeaSponsorForSa,
  feaSponsorForSaDetail,
  deleteFeaSponsorForSa,
  speakerHdBySa,
  sponsorHdBySa,
  expoHdBySa,
  sessionHdBySa,
  schedAgHdBySa,
  stageHdBySa,
  eventHdBySa,
  eveFeedHdBySa,
  eveFeedCmntHdBySa,
  loungeHdBySa,
  notificationHdBySa,
  organizationHdBySa,
  speCollHdBySa,
  spoCollHdBySa,
  zoomHdBySa
}
