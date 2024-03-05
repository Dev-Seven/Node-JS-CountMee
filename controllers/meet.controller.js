const bcrypt = require('bcrypt')
const moment = require('moment')
const fs = require("fs")
const axios = require('axios')
var jwt = require("jsonwebtoken")

const { catchError, pick, response, genJwtHash, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { eventModel } = require('../models/event')
const { loungeModel } = require('../models/lounge')
const { meetModel } = require('../models/meet')
const { userModel } = require('../models/user')
const { zmKeyModel } = require('../models/zmKey')
const socket = require('../services/socket')
const bcryptSalt = bcrypt.genSaltSync(9)

class Meet {
  async requestForZoomMeet(req, res) {
    try {
      // const schedTime = moment(new Date(req.body.schedTime)).format("DD/MM/YYYY HH:mm:ss");
      const schedTime = req.body.schedTime;
      const topic = req.body.topic;
      const eventId = req.body.eventId;

      const existingMeetTopic = await meetModel.find({ eventId, topic });
      // if (existingMeetTopic.length) {
      //       if (existingMeetTopic.eventId === req.body.eventId && existingMeetTopic.topic === req.body.topic ) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_req_tpc')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_reqqq_tpc')
      //     }
      //   }

      const reqZmUser = await userModel.findOneAndUpdate({ email: req.body.requestedUser }, {
        eventId : req.body.eventId,
        isRequestedUser : true,
      }, { new: true });

      const reqZmAccpUser = await userModel.findOneAndUpdate({ email: req.body.reqAcceptUser }, {
        eventId : req.body.eventId,
        isRequestedUser : false,
      }, { new: true });

      let reqUserForMeet = [];
      if(req.body.requestedUser){
        let requestedUser = await req.body.requestedUser.split(",")
        for (let i = 0; i < requestedUser.length; i++) {
          const requestedUserName = await userModel.findOne({ eventId : req.body.eventId , email : requestedUser[i] });
          reqUserForMeet.push(requestedUserName);
        }
      }

      let reqAcceptUserForMeet = [];
      if(req.body.reqAcceptUser){
        let reqAcceptUser = await req.body.reqAcceptUser.split(",")
        for (let i = 0; i < reqAcceptUser.length; i++) {
          const reqAcceptUserName = await userModel.findOne({ eventId : req.body.eventId , email : reqAcceptUser[i] });
          reqAcceptUserForMeet.push(reqAcceptUserName);
        }
      }


      if (req.body.requestedUser==req.body.reqAcceptUser) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'cnt_s_req', { status: 0 })
      }

      const meet = new meetModel({
        eventId : req.body.eventId,
        topic : req.body.topic,
        schedTime : schedTime,
        requestedUser : reqUserForMeet,
        reqAcceptUser : reqAcceptUserForMeet,
        requestedUserId : req.body.requestedUser,
        reqAcceptUserId : req.body.reqAcceptUser,
        meetUser:  req.body.meetUser.split(","),
      })
      const meetSoc = new meetModel({
        eventId : req.body.eventId,
        topic : req.body.topic,
        schedTime : schedTime,
        requestedUser : reqUserForMeet[0].logo,
        reqAcceptUser : reqAcceptUserForMeet[0].logo,
        requestedUserId : req.body.requestedUser,
        reqAcceptUserId : req.body.reqAcceptUser,
      })
      await meet.save()
      await reqZmUser.save()
      await reqZmAccpUser.save()
      socket.emit("reqForMeet", meet)
      return response(req, res, status.Create, jsonStatus.Create, 'm_req_scc', { status: 1, data: meet })
    } catch (error) {  
    return catchError('Meet.requestForZoomMeet', error, req, res)
    }
  }

  async editReqForZoomMeet(req, res) {
    try { 

      let reqUserForMeet = [];
      if(req.body.requestedUser){
        let requestedUser = await req.body.requestedUser.split(",")
        for (let i = 0; i < requestedUser.length; i++) {
          const requestedUserName = await userModel.findOne({ eventId : req.body.eventId , email : requestedUser[i] });
          reqUserForMeet.push(requestedUserName);
        }
      }

      let reqAcceptUserForMeet = [];
      if(req.body.reqAcceptUser){
        let reqAcceptUser = await req.body.reqAcceptUser.split(",")
        for (let i = 0; i < reqAcceptUser.length; i++) {
          const reqAcceptUserName = await userModel.findOne({ eventId : req.body.eventId , email : reqAcceptUser[i] });
          reqAcceptUserForMeet.push(reqAcceptUserName);
        }
      }

      const schedTime = moment(new Date(req.body.schedTime)).format("DD/MM/YYYY HH:mm:ss");
      const meet = await meetModel.findByIdAndUpdate( req.body._id, {
        eventId : req.body.eventId,
        topic : req.body.topic,
        schedTime : schedTime,
        requestedUser : reqUserForMeet,
        reqAcceptUser : reqAcceptUserForMeet,
        status: 1,
      }, {new: true });
      await meet.save()
      return response(req, res, status.OK, jsonStatus.OK, 'm_req_u_scc', { status: 1, data: meet })
    } catch (error) {  
    return catchError('Meet.editReqForZoomMeet', error, req, res)
    }
  }

  async reqAcceptForZoomMeet(req, res) {
    try {
      const reqAcceptUserId = req.body.reqAcceptUser;
      const userAccpt = await meetModel.find({_id: req.body._id})
      if (userAccpt[0].reqAcceptUserId != reqAcceptUserId) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'cnt_acc', { status: 0 })
      }
        const meet = await meetModel.findOneAndUpdate({ _id: req.body._id }, {
            eventId : req.body.eventId,
            status: 1,
        }, { new: true });
        const meetSoc = await meetModel.findOne({ _id: req.body._id }, {
          eventId : 1,
          status: 1,
        }, { new: true });
        // const reqZmUser = await userModel.findOneAndUpdate({ email: req.body.requestedUser }, { //cmnt for req
        //     eventId : req.body.eventId,
        //     isRequestedUser : true,
        // }, { new: true });
        // const reqAccZmUser = await userModel.findOneAndUpdate({ email: req.body.reqAcceptUser }, {
        //     eventId : req.body.eventId,
        //     isReqAcceptUser : true
        // }, { new: true });
        await meet.save()
        socket.emit("reqAcceptForMeet", meet)
        // await reqZmUser.save()
        // await reqAccZmUser.save()
        return response(req, res, status.OK, jsonStatus.OK, 'mt_req_acct', { status: 1, data: meet })
    } catch (error) {
        return catchError('Meet.reqAcceptForZoomMeet', error, req, res)
    }
  }

  async reqCancellForZoomMeet(req, res) {
    try {
        const meet = await meetModel.findOneAndUpdate({ _id: req.body._id }, {
            eventId : req.body.eventId,
            status: -1,
        }, { new: true });
        const reqZmUser = await userModel.findOneAndUpdate({ email: req.body.requestedUser }, {
          eventId : req.body.eventId,
          isRequestedUser : false,
        }, { new: true });
        const reqAccZmUser = await userModel.findOneAndUpdate({ email: req.body.reqAcceptUser }, {
          eventId : req.body.eventId,
          isReqAcceptUser : false
        }, { new: true });
        const meetSoc = await meetModel.findOne({ _id: req.body._id }, {
          eventId : 1,
          status: 1,
        }, { new: true });
        await meet.save()
        await reqZmUser.save()
        await reqAccZmUser.save()
        socket.emit("reqCancellForMeet", meet)
        return response(req, res, status.OK, jsonStatus.OK, 'mt_req_acct', { status: 1, data: meet })
    } catch (error) {
        return catchError('Meet.reqCancellForZoomMeet', error, req, res)
    }
  }

  async joinSchedZoomMeeting(req, res, next) {
    try {
      const avaiAcc = await zmKeyModel.find({ status: 1}).limit(1)
      if(avaiAcc.length == 0) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_zm_ac', { status: 0 })
      }

      const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
        topic: req.body.topic,
        type: req.body.type,
        start_time: req.body.start_time,
        duration: req.body.duration,
        timezone: req.body.timezone,
        password: req.body.password,
        agenda: req.body.agenda,
        "settings": {
          "host_video": true,
          "participant_video": true,
          "cn_meeting": false,
          "in_meeting": true,
          "join_before_host": false,
          "mute_upon_entry": false,
          "watermark": false,
          "use_pmi": false,
          "approval_type": 2,
          "audio": "both",
          "auto_recording": "local",
          "enforce_login": false,
          "registrants_email_notification": false,
          "waiting_room": true,
          "allow_multiple_devices": true
        }
      }, {
        headers: {
          'Authorization': 'Bearer ' + avaiAcc[0].token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      // let endDate = moment(new Date()).format("DD/MM/YYYY hh:mm a")
      // const schedMeet = await meetModel.findById({_id: req.body._id})
      // if (endDate.valueOf() < schedMeet.schedTime.valueOf()) {
      //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'smthg_wrg', { status: 0 })
      // }
      const meet = await meetModel.findOneAndUpdate({_id : req.body._id}, {
          zoom_link: result.data.start_url,
          status : 1
      }, { new: true });
      const lounge = await zmKeyModel.findOneAndUpdate({email : avaiAcc[0].email}, {
          status: 0,
        }, { new: true });
      const meetSoc = await meetModel.findOne({ _id: req.body._id }, {
          eventId : 1,
          zoom_link : 1,
          status: 1,
       }, { new: true });
        socket.emit("joinSchedMeet", meetSoc)
        // socket.emit("joinSchedMeet", [meetSoc,lounge])
      return response(req, res, status.Create, jsonStatus.Create, 'success', { status: 1, data: meet.zoom_link })
    } catch (error) {
      if (error.response){
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'tkn_exp', { status: 0 })
      }
      return catchError('Meet.joinSchedZoomMeeting', error, req, res)
    }
  }

  async zmKyys (req, res, next) {
    try {
      const zmKey = await zmKeyModel.find({}).sort({_id: -1 })
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: zmKey })
    } catch (error) {
      return catchError('Meet.zmKyys', error, req, res)
    }
  }

  async updZmKeys(req, res) {
    try { 
      const zmKey = await zmKeyModel.findByIdAndUpdate( req.body._id, {
        email: req.body.email,
        api_key: req.body.api_key,
        api_secret: req.body.api_secret,
        token: req.body.token,
        status: req.body.status,
      }, {new: true });
      await zmKey.save()
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1 })
    } catch (error) {  
    return catchError('Meet.updZmKeys', error, req, res)
    }
  }

  async zmHdBySa(req, res, next) {
    try {
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const zmKeys = await zmKeyModel.findById( {_id : req.body._id} );
        const sessionUpdate = await zmKeyModel.findOneAndDelete( {email:zmKeys.email,
          api_key:zmKeys.api_key, 
          api_secret:zmKeys.api_secret, 
          token:zmKeys.token, 
        });
        const agendaUpdate = await loungeModel.findOneAndDelete( {email:zmKeys.email,
          api_key:zmKeys.api_key, 
          api_secret:zmKeys.api_secret, 
          token:zmKeys.token,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Meet.zmHdBySa', error, req, res)
    }
  }

  async allReqZoomMeetByEvent (req, res, next) {
    try {
      const meet = await meetModel.find( { status : [ 0 ] , eventId : req.body.eventId } ).sort({_id: -1 })
      if (!meet) return next(new Error('There is no scheduled meet on above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {
      return catchError('Meet.allReqZoomMeetByEvent', error, req, res)
    }
  }

  async allReqZoomMeetForUser (req, res, next) {
    try {
      const meet = await meetModel.find( { status : [ 0,1,-1 ] ,  eventId: req.body.eventId, meetUser : req.body.meetUser } ).sort({_id: -1 })
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {
      return catchError('Meet.allReqZoomMeetForUser', error, req, res)
    }
}

  async allReqAccepZoomMeetForUser (req, res, next) {
    try {
      const meet = await meetModel.find( { status : [ 0,1,-1 ] , eventId: req.body.eventId, reqAcceptUserId : req.body.reqAcceptUserId } ).sort({_id: -1 })
      if (!meet) return next(new Error('There is no scheduled meet request for accept on above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {
      return catchError('Meet.allReqAccepZoomMeetForUser', error, req, res)
    }
  }

}

module.exports = new Meet()