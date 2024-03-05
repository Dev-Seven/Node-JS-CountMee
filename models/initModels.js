const DataTypes = require('mongoose').DataTypes
// const _message = require('./message')

const user = require('./user')
const banner = require('./banner')
const customForm = require('./customForm')
const chat = require('./chat')
const chatNotification = require('./chatNotification')
const event = require('./event')
const eventFeed = require('./eventFeed')
const eveFeedCmnt = require('./eveFeedCmnt')
const expo = require('./expo')
const generalSetting = require('./generalSetting')
const informationDesk = require('./informationDesk')
const lounge = require('./lounge')
const meet = require('./meet')
const notification = require('./notification')
const organization = require('./organization')
const partner = require('./partner')
const sponsorColl = require('./sponsorColl')
const userDevice = require('./userDevice')
const schedule = require('./schedule')
const superAdmin = require('./superAdmin')
const staticPage = require('./staticPage')
const speaker = require('./speaker')
const speakerColl = require('./speakerColl')
const sponsor = require('./sponsor')
const stage = require('./stage')
const session = require('./session')
const userEventDetail = require('./userEventDetail')
const userRegEvent = require('./userRegEvent')
const zmKey = require('./zmKey')
const zoom = require('./zoom')

function initModels(mongoose) {

  return {
    user,
    banner,
    customForm,
    chat,
    chatNotification,
    event,
    eventFeed,
    eveFeedCmnt,
    expo,
    generalSetting,
    informationDesk,
    lounge,
    meet,
    notification,
    partner,
    sponsorColl,
    organization,
    userDevice,
    superAdmin,
    schedule,
    staticPage,
    speaker,
    speakerColl,
    sponsor,
    stage,
    session,
    userEventDetail,
    userRegEvent,
    zmKey,
    zoom
  }
}
module.exports = initModels
module.exports.default = initModels
