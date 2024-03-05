const { body } = require('express-validator')

const storeKeysforMeet = [
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('api_key').not().isEmpty(),
  body('api_secret').not().isEmpty(),
  body('token').not().isEmpty()
]

const addLoungeTable = [
  // body('superAdminId').not().isEmpty(), //cmnt for lounge static
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
  // body('name').not().isEmpty(),
  body('topic').not().isEmpty(),
  // body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  // body('api_key').not().isEmpty(),
  // body('api_secret').not().isEmpty(),
  // body('token').not().isEmpty(),
  // body('capacity').not().isEmpty(),
  // body('zoom_link').not().isEmpty(),
]

const editLoungeTable = [
  body('superAdminId').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('lounge_id').not().isEmpty(),
]

const storeKeysforMeetBySa = [
  body('superAdminId').not().isEmpty(),
  // body('eventId').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('api_key').not().isEmpty(),
  body('api_secret').not().isEmpty(),
  body('token').not().isEmpty()
]

const editKeysForMeetBySa = [
  body('superAdminId').not().isEmpty(),
  // body('eventId').not().isEmpty(),
  // body('lounge_id').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const meetKeyById = [
  body('_id').not().isEmpty()
]

const keyDeleteBySa = [
  body('_id').not().isEmpty(),
  body('superAdminId').not().isEmpty()
]

const addLoungeTableBySa = [
  body('superAdminId').not().isEmpty(),
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const editLoungeTableBySa = [
  body('superAdminId').not().isEmpty(),
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const editLoungeTableByOrg = [
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const loungeByEvent = [
  body('eventId').not().isEmpty(),
]

const isJoinLounge = [
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty(),
  // body('email').not().isEmpty(),
  body('userId').not().isEmpty(),
]

const isExitFromLounge = [
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty(),
  // body('email').not().isEmpty(),
  body('userId').not().isEmpty(),
]

const loungeSeatAvailOnEvent = [
  body('eventId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const loungeDetailByEventOrg = [
  body('organizationId').not().isEmpty(),
  body('_id').not().isEmpty(),
]

const availLoungeOnOrg = [
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

const deleteLoungeTable = [
  body('superAdminId').not().isEmpty(),
  body('id').not().isEmpty()
]

const deleteLoungeTableBySa = [
  body('superAdminId').not().isEmpty(),
  body('organizationId').not().isEmpty(),
  body('eventId').not().isEmpty(),
]

module.exports = {
    storeKeysforMeet,
    addLoungeTable,
    editLoungeTable,
    storeKeysforMeetBySa,
    editKeysForMeetBySa,
    meetKeyById,
    keyDeleteBySa,
    addLoungeTableBySa,
    editLoungeTableBySa,
    editLoungeTableByOrg,
    loungeByEvent,
    isJoinLounge,
    isExitFromLounge,
    loungeSeatAvailOnEvent,
    loungeDetailByEventOrg,
    deleteLoungeTable,
    availLoungeOnOrg,
    deleteLoungeTableBySa
}
