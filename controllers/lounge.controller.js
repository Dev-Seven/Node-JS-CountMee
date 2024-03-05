const bcrypt = require('bcrypt')
const moment = require('moment')
const csv = require("fast-csv")
const fs = require("fs")
const axios = require('axios')
const mongoose = require('mongoose')
var jwt = require("jsonwebtoken")

const { catchError, pick, response, genJwtHash, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { eventModel } = require('../models/event')
const { organizationModel } = require('../models/organization')
const { loungeModel } = require('../models/lounge')
const { userModel } = require('../models/user')
const { zmKeyModel } = require('../models/zmKey')
const socket = require('../services/socket')
const bcryptSalt = bcrypt.genSaltSync(9)

class Lounge {
  async storeKeysforMeet(req, res) {
    try {
      const lounge = new loungeModel({
        email : req.body.email,
        api_key: req.body.api_key,
        api_secret: req.body.api_secret,
        token : req.body.token,
      })
        const api_key = req.body.api_key;
        const existingKey = await loungeModel.findOne({ api_key });
        if (existingKey) {
          if (existingKey.api_key === req.body.api_key) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_key_exists')
          } else if (existingKey.api_secret === req.body.api_secret) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_secret_exists')
          } else if (existingKey.token === req.body.token) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'token_exists')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
          }
        }
      await lounge.save()
      return response(req, res, status.Create, jsonStatus.Create, 'key_stored', { status: 1, data: lounge })
    } catch (error) {  
    return catchError('Lounge.storeKeysforMeet', error, req, res)
    }
  }

  async allStoredKey (req, res) {
    try {
      const lounges = await loungeModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounges })
    } catch (error) {
      return catchError('Lounge.allStoredKey', error, req, res)
    }
  }

  async addLoungeTable(req, res) {
    try {
      /* //cmnt for static lounge
      const lounge = new loungeModel({
        superAdminId : req.body.superAdminId,
        eventId : req.body.eventId,
        name: req.body.name,
        topic: req.body.topic,
        email : req.body.email,
        api_key : req.body.api_key,
        api_secret : req.body.api_secret,
        token : req.body.token,
        capacity : req.body.capacity,
        zoom_link : req.body.zoom_link,
      })
      const api_key = req.body.api_key;
      const api_secret = req.body.api_secret;
      const email = req.body.email;
        const existingKey = await loungeModel.findOne({ api_key, api_secret, email });
        if (existingKey) {
          if (existingKey.api_key === req.body.api_key) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_key_exists')
          } else if (existingKey.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_exists')
          } else if (existingKey.api_secret === req.body.api_secret) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_secret_exists')
          } else if (existingKey.token === req.body.token) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'token_exists')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'key_already_exists')
          }
        }
      let { capacity} = req.body
      if (!(capacity == 2 || capacity == 4 || capacity == 6 ))
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_valid')
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        lounge.logo = path
      }
      */ //cmnt for static lounge
      const organizationId = req.body.organizationId;
      const user = await userModel.findById({ _id:organizationId });
      if (user.role === "organization") {
        const lounge = new loungeModel({
          organizationId : req.body.organizationId,
          eventId : req.body.eventId,
          name: req.body.name,
          topic: req.body.topic,
        })
        lounge.save()
        return response(req, res, status.Create, jsonStatus.Create, 'table_create', { status: 1, data: lounge })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Lounge.addLoungeTable', error, req, res)
    }
  }

  async editLoungeTable(req, res) {
    try { 
      const lounge = await loungeModel.findByIdAndUpdate( req.body.lounge_id, {
        name: req.body.name,
        topic: req.body.topic,
        email : req.body.email,
        api_key : req.body.api_key,
        api_secret : req.body.api_secret,
        token : req.body.token,
        capacity : req.body.capacity,
        zoom_link : req.body.zoom_link,
        status: 1,
      }, {new: true });
      const api_key = req.body.api_key;
      const api_secret = req.body.api_secret;
      const email = req.body.email;
        const existingKey = await loungeModel.findOne({ api_key, api_secret, email });
        if (existingKey) {
          if (existingKey.api_key === req.body.api_key) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_key_exists')
          } else if (existingKey.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_exists')
          } else if (existingKey.api_secret === req.body.api_secret) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_secret_exists')
          } else if (existingKey.token === req.body.token) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'token_exists')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'key_already_exists')
          }
        }
      let { capacity} = req.body
      if (!(capacity == 2 || capacity == 4 || capacity == 6 ))
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_valid')
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        lounge.logo = path
      }
      lounge.save()
      return response(req, res, status.OK, jsonStatus.OK, 'table_updated', { status: 1, data: lounge })
    } catch (error) {  
    return catchError('Lounge.editLoungeTable', error, req, res)
    }
  }

  async allLoungeTable (req, res) {
    try {
      const lounges = await loungeModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounges })
    } catch (error) {
      return catchError('Lounge.allLoungeTable', error, req, res)
    }
  }

  async totalLounge (req, res) {
    try {
      const lounge = await loungeModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounge })
    } catch (error) {
      return catchError('Lounge.totalLounge', error, req, res)
    }
  }

  async deleteLoungeTable (req, res, next) {
    try {
      await loungeModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      res.status(200).json('Lounge table has been deleted successfully.');
    } catch (error) {
      res.status(500).json(error)
    }
  }

  async deleteLoungeTableBySa (req, res, next) {
    try {
      const superAdminId = req.body.superAdminId;
      const organizationId = req.body.organizationId;
      const eventId = req.body.eventId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const lounge = await loungeModel.deleteMany( { superAdminId:superAdminId,organizationId:organizationId,eventId:eventId });
        return response(req, res, status.OK, jsonStatus.OK, 'lng_tb_d', { status: 1 })
      } else{
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {
      return catchError('Lounge.deleteLoungeTableBySa', error, req, res)
    }
  }

  async storeKeysforMeetBySa(req, res) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const api_key = req.body.api_key;
        const existingKey = await zmKeyModel.findOne({ api_key });
        if (existingKey) {
          if (existingKey.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_exists')
          } else if (existingKey.api_secret === req.body.api_secret) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_secret_exists')
          } else if (existingKey.api_secret === req.body.api_secret) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'api_secret_exists')
          } else if (existingKey.token === req.body.token) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'token_exists')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
          }
        }
      const zmKey = new zmKeyModel({
        superAdminId: req.body.superAdminId,
        eventId : req.body.eventId,
        meetType : req.body.meetType,
        email : req.body.email,
        api_key: req.body.api_key,
        api_secret: req.body.api_secret,
        token : req.body.token,
        type : "Scheduled"
      })
      await zmKey.save()
      return response(req, res, status.Create, jsonStatus.Create, 'key_stored', { status: 1, data: zmKey })
    } else {
      return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
    }
    } catch (error) {  
    return catchError('Lounge.storeKeysforMeetBySa', error, req, res)
    }
  }

  async editKeysForMeetBySa(req, res) {
    try { 
      let role;
      let superAdmin;
      const _id = req.body._id;
      const superAdminId = req.body.superAdminId;
      const eventId = req.body.eventId;
      const email = req.body.email;
      const api_key= req.body.api_key;
      const api_secret= req.body.api_secret;
      const token = req.body.token;
      const user = await userModel.findById({ _id:superAdminId });
      if(user.role === "superAdmin") {
        const existingMeetEmail = await zmKeyModel.findOne({ _id : { $ne : _id },  superAdminId, email });
        if (existingMeetEmail) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'mt_email_alr_ex')
          }
        const existingMeetApiKey = await zmKeyModel.findOne({ _id : {$ne : _id }, superAdminId, api_key });
        if (existingMeetApiKey) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'mt_apiK_alr_ex')
          }
        const existingMeetApiSecret = await zmKeyModel.findOne({ _id : {$ne : _id }, superAdminId, api_secret });
        if (existingMeetApiSecret) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'mt_apiSec_alr_ex')
          }
        const existingMeetToken = await zmKeyModel.findOne({ _id : {$ne : _id }, superAdminId, token });
        if (existingMeetToken) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'mt_tkn_alr_ex')
          }
          const meetKeys = await zmKeyModel.findByIdAndUpdate( req.body._id, {
           email : req.body.email,
           api_key : req.body.api_key,
           api_secret : req.body.api_secret,
           token : req.body.token,
            status : 1,
          }, {new: true });
          await meetKeys.save()
          return response(req, res, status.OK, jsonStatus.OK, 'key_updated', { status: 1, data: meetKeys })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Lounge.editKeysForMeetBySa', error, req, res)
    }
  }

  async allStoredKeyForMeet (req, res) {
    try {
      const meet = await zmKeyModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {
      return catchError('Lounge.allStoredKeyForMeet', error, req, res)
    }
  }

  async meetKeyById (req, res , next)  {
    try {
      const meetId = req.body._id;
      const meet = await zmKeyModel.findById(meetId);
      if (!meet) return next(new Error('Key does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {  
      return catchError('Lounge.meetKeyById', error, req, res)
    }
  }

  async keyDeleteBySa(req, res, next) {
    try {
        await zmKeyModel.findByIdAndDelete(req.body._id, { status: -1 , deleted_by_sa : req.body.superAdminId });
        return response(req, res, status.OK, jsonStatus.OK, 'key_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Lounge.keyDeleteBySa', error, req, res)
    }
  }

  async addLoungeTableBySaOld(req, res) {
    try {
      const organizationId = req.body.organizationId
      const eventId = req.body.eventId
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      const orgName = await userModel.findById({_id:organizationId})
      const eveName = await eventModel.findById({_id:eventId})
      if (user.role === "superAdmin") {
      const existingEvent = await loungeModel.find({ eventId });
       if (existingEvent.length) {
            if (existingEvent.eventId === req.body.eventId ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'eve_ext')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'evve_ext')
          }
        }
        let responce=[]
        if(req.body.lounge2){
          for(let i=0;i<req.body.lounge2;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 2,
              start_time: req.body.start_time,
              duration: 30,
              timezone: req.body.timezone,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 2,
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
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat3:{},seat4:{},seat5:{},seat6:{},seat7:{},seat8:{}},  
              type : "2",
              zoom_link: result.data.start_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge4){
          for(let i=0;i<req.body.lounge4;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 2,
              start_time: req.body.start_time,
              duration: 30,
              timezone: req.body.timezone,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 4,
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
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat5:{},seat6:{},seat7:{},seat8:{}},  
              type : "4",
              zoom_link: result.data.start_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge6){
          for(let i=0;i<req.body.lounge6;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 2,
              start_time: req.body.start_time,
              duration: 30,
              timezone: req.body.timezone,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 6,
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
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat7:{},seat8:{}},  
              type : "6",
              zoom_link: result.data.start_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge8){
          for(let i=0;i<req.body.lounge8;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 2,
              start_time: req.body.start_time,
              duration: 30,
              timezone: req.body.timezone,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 8,
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
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{},  
              type : "8",
              zoom_link: result.data.start_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if (req.body.lounge2 == 0 && req.body.lounge4 == 0 && req.body.lounge6 == 0 &&  req.body.lounge8 == 0 ) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'y_cnt_n', { status: 0 })
        }
        // if(avaiAcc.length < responce.length) {
        //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_l_zm', { status: 0 })
        // }
        return response(req, res, status.Create, jsonStatus.Create, 'table_create', { status: 1, data: responce })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) { 
      if (error.response){
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'tkn_exp', { status: 0 })
      } 
    return catchError('Lounge.addLoungeTableBySa', error, req, res)
    }
  }

  async addLoungeTableBySa(req, res) {
    try {
      const organizationId = req.body.organizationId
      const eventId = req.body.eventId
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      const orgName = await userModel.findById({_id:organizationId})
      const eveName = await eventModel.findById({_id:eventId})
      if (user.role === "superAdmin") {
      const existingEvent = await loungeModel.find({ eventId });
       if (existingEvent.length) {
            if (existingEvent.eventId === req.body.eventId ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'eve_ext')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'evve_ext')
          }
        }
        let responce=[]
        if(req.body.lounge2){
          for(let i=0;i<req.body.lounge2;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 3,
              duration: 30,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 2,
              settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
              }
            }, {
              headers: {
                'Authorization': 'Bearer ' + avaiAcc[0].token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
              }
            });
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat3:{},seat4:{},seat5:{},seat6:{},seat7:{},seat8:{}},  
              type : "2",
              zoom_link: result.data.join_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge4){
          for(let i=0;i<req.body.lounge4;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 3,
              duration: 30,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 4,
              settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
              }
            }, {
              headers: {
                'Authorization': 'Bearer ' + avaiAcc[0].token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
              }
            });
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat5:{},seat6:{},seat7:{},seat8:{}},  
              type : "4",
              zoom_link: result.data.join_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge6){
          for(let i=0;i<req.body.lounge6;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 3,
              duration: 30,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 6,
              settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
              }
            }, {
              headers: {
                'Authorization': 'Bearer ' + avaiAcc[0].token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
              }
            });
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{seat7:{},seat8:{}},  
              type : "6",
              zoom_link: result.data.join_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if(req.body.lounge8){
          for(let i=0;i<req.body.lounge8;i++){
            const avaiAcc = await zmKeyModel.find({ status: 1, meetType: 'Lounge'})
            const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc[0].email + "/meetings", {
              topic: req.body.topic,
              type: 3,
              duration: 30,
              password: req.body.password,
              agenda: req.body.agenda,
              participants_count: 8,
              settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
              }
            }, {
              headers: {
                'Authorization': 'Bearer ' + avaiAcc[0].token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
              }
            });
            const lounge = new loungeModel({
              superAdminId : req.body.superAdminId,
              organizationId : req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              seats:{},  
              type : "8",
              zoom_link: result.data.join_url,
              organizationName : orgName.name,
              eventName : eveName.name,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
            })
            responce.push(lounge)
            lounge.save()
          }
        }
        if (req.body.lounge2 == 0 && req.body.lounge4 == 0 && req.body.lounge6 == 0 &&  req.body.lounge8 == 0 ) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'y_cnt_n', { status: 0 })
        }
        // if(avaiAcc.length < responce.length) {
        //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_l_zm', { status: 0 })
        // }
        return response(req, res, status.Create, jsonStatus.Create, 'table_create', { status: 1, data: responce })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) { 
      if (error.response){
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'tkn_exp', { status: 0 })
      } 
    return catchError('Lounge.addLoungeTableBySa', error, req, res)
    }
  }

  async allLoungeTableBySa (req, res) {
    try {
      // const lounge2 = await loungeModel.find( {},{organizationName:1,eventName:1,lounge2:1} )
      // const lounge4 = await loungeModel.find( {},{organizationName:1,eventName:1,lounge4:1} )
      // const lounge6 = await loungeModel.find( {},{organizationName:1,eventName:1,lounge6:1} )
      // const lounge8 = await loungeModel.find( {},{organizationName:1,eventName:1,lounge8:1,} )
      // return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {lounge2:lounge2,lounge4:lounge4,lounge6:lounge6,lounge8:lounge8} })

      const lounge = await loungeModel.find( {},{_id:1, organizationId:1, eventId:1,organizationName:1,eventName:1,lounge2:1,lounge4:1,lounge6:1,lounge8:1} ).sort({_id:-1})  
      const array = lounge
      const key = 'eventName';

      const arrayUniqueByKey = [...new Map(array.map(item =>
        [item[key], item])).values()];

      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: arrayUniqueByKey })
    } catch (error) {
      return catchError('Lounge.allLoungeTableBySa', error, req, res)
    }
  }

  async editLoungeTableBySa(req, res) {
    try { 
        let role;
        let superAdmin;
        const _id = req.body._id;
        const superAdminId = req.body.superAdminId;
        const eventId = req.body.eventId;
        const name = req.body.name;
        const topic = req.body.topic;
        const email = req.body.email;
        const api_key = req.body.api_key;
        const api_secret = req.body.api_secret;
        const token = req.body.token;
        const capacity = req.body.capacity;
        const zoom_link = req.body.zoom_link;
        const user = await userModel.findById({ _id:superAdminId });
        if(user.role === "superAdmin") {
          const existingMeetEmail = await loungeModel.findOne({ _id : { $ne : _id },  superAdminId, email });
          if (existingMeetEmail) {
                return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'l_email_alr')
            }
          const existingMeetApiKey = await loungeModel.findOne({ _id : {$ne : _id }, superAdminId, api_key });
          if (existingMeetApiKey) {
                return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'l_ak_alr')
            }
          const existingMeetApiSecret = await loungeModel.findOne({ _id : {$ne : _id }, superAdminId, api_secret });
          if (existingMeetApiSecret) {
                return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'l_as_alr')
            }
          const existingMeetToken = await loungeModel.findOne({ _id : {$ne : _id }, superAdminId, token });
          if (existingMeetToken) {
                return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'l_tkn_alr')
            }
          // const existingZoomLink = await loungeModel.findOne({ _id : {$ne : _id }, superAdminId, zoom_link });
          // if (existingZoomLink) {
          //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'l_zm_alr')
          //   }
            const lounge = await loungeModel.findByIdAndUpdate( req.body._id, {
              superAdminId: req.body.superAdminId,
              eventId : req.body.eventId,
              name: req.body.name,
              topic: req.body.topic,
              email : req.body.email,
              api_key : req.body.api_key,
              api_secret : req.body.api_secret,
              token : req.body.token,
              capacity : req.body.capacity,
              zoom_link : req.body.zoom_link,
              lounge2 : req.body.lounge2,
              lounge4 : req.body.lounge4,
              lounge6 : req.body.lounge6,
              lounge8 : req.body.lounge8,
              status : 1,
            }, {new: true });
            // let { capacity} = req.body
            // if (!(capacity == 2 || capacity == 4 || capacity == 6 ))
            //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_valid')
            if(req.files){
              let path = ''
              req.files.forEach(function(files, index, arr){
                path = path + files.path + ','
              })
              path = path.substring(0, path.lastIndexOf(","))
              lounge.logo = path
            }
        await lounge.save()
        return response(req, res, status.OK, jsonStatus.OK, 'table_updated', { status: 1, data: lounge })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Lounge.editLoungeTableBySa', error, req, res)
    }
  }

  async editLoungeTableByOrg(req, res) {
    try { 
        const _id = req.body._id;
        const organizationId = req.body.organizationId;
        const eventId = req.body.eventId;
        const topic = req.body.topic;
        const user = await userModel.findById({ _id:organizationId });
        if(user.role === "organization") {
            const lounge = await loungeModel.findByIdAndUpdate( req.body._id, {
              organizationId: req.body.organizationId,
              eventId : req.body.eventId,
              topic: req.body.topic,
              status : 1,
            }, {new: true });
            if(req.files){
              let path = ''
              req.files.forEach(function(files, index, arr){
                path = path + files.path + ','
              })
              path = path.substring(0, path.lastIndexOf(","))
              lounge.logo = path
            }
        await lounge.save()
        return response(req, res, status.OK, jsonStatus.OK, 'table_updated', { status: 1, data: lounge })
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Lounge.editLoungeTableByOrg', error, req, res)
    }
  }

  async secKeyBulkUpload(req, res) {
    const fileRows_speaker = [];
    let Speaker_SuccessData = [];
    let speaker_duplicateData = [];
    let speaker_invalid = [];

    const superAdminId = req.body.superAdminId;
    const user = await userModel.findById({ _id:superAdminId });
    if(user.role != "superAdmin") {
      return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
    }

    const dbId = await zmKeyModel.find({
      eventId: req.body.eventId,
    });
    try {
      if (dbId.length > 0) {
        csv
          .parseFile(req.file.path)
          .on("data", function (data) {
            fileRows_speaker.push(data); // push each row
          })
          .on("end", async function () {
            fs.unlinkSync(req.file.path); // remove temp file
  
            const validationError = await Speaker_validateCsvData(
              fileRows_speaker
            );
    
            if (validationError) {
              res.json({
                code: 400,
                message: "Invalid csv format please check sample csv.",
              });
            }
  
            if (
              Speaker_SuccessData.length == 0 &&
              speaker_invalid.length == 0 &&
              speaker_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message: "All rows are duplicate.",
              });
            }
    
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_invalid.length == 0 &&
              speaker_duplicateData.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows : ${Speaker_SuccessData.length} , Duplicate rows : ${speaker_duplicateData.length}`
              });
            }
    
            if (
              Speaker_SuccessData.length == 0 &&
              speaker_invalid.length > 0 &&
              speaker_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message:`Invalid rows : ${speaker_invalid.length} , Duplicate rows   : ${speaker_duplicateData.length}`
              });
            }
    
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_invalid.length == 0 &&
              speaker_duplicateData.length == 0
            ) {
              return res.json({
                code: 200,
                message:` Add rows : ${Speaker_SuccessData.length}`
              });
            }
    
            if (
              speaker_duplicateData.length == 0 &&
              speaker_invalid.length > 0 &&
              Speaker_SuccessData.length == 0
            ) {
              return res.json({
                code: 400,
                message: " All rows are invalid.",
              });
            }
    
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_duplicateData.length > 0 &&
              speaker_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Duplicate rows : ${speaker_duplicateData.length} , Add rows : ${Speaker_SuccessData.length}, Invalid rows : ${speaker_invalid.length}`
              });
            }
    
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_duplicateData.length == 0 &&
              speaker_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message:`Add rows : ${Speaker_SuccessData.length} , Invalid rows : ${speaker_invalid.length}`
              });
            }
          });
      } else {
        return res.json({
          code: 400,
          // message: 'Event does not exist.'
          message: 'You need to add atleast one data for bulk upload.'
        });
      }
    } catch (error) {
      console.log("Error:", error);
    }
    
    async function Speaker_validateCsvData(speaker_row) { //validate CsvData
      try {
        if (
          speaker_row[0][0] == "email" &&
          speaker_row[0][1] == "api_key" &&
          speaker_row[0][2] == "api_secret" &&
          speaker_row[0][3] == "token" &&
          speaker_row[0][4] == "meetType"
        ) {
          const dataRows = speaker_row.slice(1, speaker_row.length); //ignore header at 0 and get rest of the rows
  
          let dataRow = dataRows.map((x) => ({
            email: x[0],
            api_key: x[1],
            api_secret: x[2],
            token: x[3],
            meetType: x[4],
          }));
  
          // uniqe CSV email
          const key = "email";
          const rowObjs = [
            ...new Map(dataRow.map((item) => [item[key], item])).values(),
          ];
  
          let objectValidate = false;
          // final_Expo_list = [];
  
          for (let i = 0; i < rowObjs.length; i++) {
            // api_key
            if (rowObjs[i].api_key) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
  
            // api_secret
            if (rowObjs[i].api_secret && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            // token
            if (rowObjs[i].token && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            // meetType
            if (rowObjs[i].meetType && objectValidate) {
              let meetType = rowObjs[i].meetType;
              let ValidatmeetType =
              /\Schedule\b/
              let ValidatmeetTypeLg =
              /\Lounge\b/
              if (meetType.match(ValidatmeetType)) {
                objectValidate = true;
              } else if(meetType.match(ValidatmeetTypeLg)){
                objectValidate = true;
              }else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }
  
            // email
            if (rowObjs[i].email && objectValidate) {
              let email = rowObjs[i].email;
              let Validatemail =
                /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
              if (email.match(Validatemail)) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }

            if (objectValidate) {
              // speakerStoreDb(rowObjs[i]);
              try {
                const eventID = await zmKeyModel.find({
                  eventId: req.body.eventId,
                });
  
                const isEmailExist = await eventID.find(
                  (item) => item.email === rowObjs[i].email
                );

                const eventIDAk = await zmKeyModel.find({
                  eventId: req.body.eventId,
                });

                const isApiKeyExist = await eventIDAk.find(
                  (item) => item.api_key === rowObjs[i].api_key
                );

                const eventIDAs = await zmKeyModel.find({
                  eventId: req.body.eventId,
                });

                const isApiSecretExist = await eventIDAs.find(
                  (item) => item.api_secret === rowObjs[i].api_secret
                );

                const eventIDTkn = await zmKeyModel.find({
                  eventId: req.body.eventId,
                });

                const isTokenExist = await eventIDTkn.find(
                  (item) => item.token === rowObjs[i].token
                );
  
                if (!isEmailExist && !isApiKeyExist && !isApiSecretExist && !isTokenExist) {
                  const speaker = await new zmKeyModel({
                    email: rowObjs[i].email,
                    api_key: rowObjs[i].api_key,
                    api_secret: rowObjs[i].api_secret,
                    token: rowObjs[i].token,
                    meetType : rowObjs[i].meetType,
                    eventId: req.body.eventId,
                    superAdminId: req.body.superAdminId,
                  });
                  await speaker.save();
                  Speaker_SuccessData.push(rowObjs[i]);
                } else {
                  speaker_duplicateData.push(rowObjs[i]);
                }
              } catch (error) {
                console.log("Error:", error);
              }
            } else {
              speaker_invalid.push(rowObjs[i]);
            }
          }
        } else {
          return "Invalid csv format please check sample csv.";
        }
      } catch (error) {  
        return catchError('Lounge.secKeyBulkUpload', error, req, res)
      }
    }
  };

  async loungeByEvent (req, res) {
    try {
      const lounge = await loungeModel.find( { eventId : req.body.eventId, status : [ 1 ]} ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounge })
    } catch (error) {
      return catchError('Lounge.loungeByEvent', error, req, res)
    }
  }

  async loungeSeatAvailOnEvent (req, res) {
    try {
      const lounge = await loungeModel.findById( { _id: req.body._id , eventId : req.body.eventId, status : [ 1 ] } ).sort({_id:-1});
      socket.emit("seatAvailOnLoungeEve", lounge)
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounge })
    } catch (error) {
      return catchError('Lounge.loungeSeatAvailOnEvent', error, req, res)
    }
  }

  async loungeByEventSa (req, res, next) {
    try {
      if (req.body.organizationId !=="null" && req.body.eventId == "null") {
        const organization = await organizationModel.find({    
          organizationId: req.body.organizationId,
          status : [0,1] 
        }).count();
        const event = await eventModel.find({
          organizationId: req.body.organizationId,
          status : [0,1]
        });
    
        let eventIds = [];
        event.forEach(event => {
          eventIds.push(event._id);
        });    
        const lounge = await loungeModel.find( { eventId: { $in: eventIds } , status : 1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, lounge:lounge }]})
      } else if (req.body.organizationId !=="null" && req.body.eventId !== "null") {
        const organization = await organizationModel.find({    
          organizationId: req.body.organizationId,
          status : [0,1] 
        }).count();
        const event = await eventModel.find({
          organizationId: req.body.organizationId,
          eventId: req.body.eventId,
          status : [0,1]
        });
    
        let eventIds = [];
        event.forEach(event => {
          eventIds.push(event._id);
        });
        const lounge = await loungeModel.find({
          eventId : req.body.eventId,
          status : [0,1],
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, lounge:lounge }]})
      }
    } catch (error) {
      return catchError('Lounge.loungeByEventSa', error, req, res)
    }
  }

  async loungeDetailByEventOrg (req, res, next) {
    try {
      const loungeId = req.body._id;
      const lounge = await loungeModel.findById(loungeId);
      if (!lounge) return next(new Error('Lounge does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounge.topic })
    } catch (error) {
      return catchError('Lounge.loungeDetailByEventOrg', error, req, res)
    }
  }

  async isJoinLounge(req, res) {
    try {
      //console.log('req', req.body);

      const eventId = req.body.eventId
      const userDetails = await userModel.findById( {_id: req.body.userId},
        {email:1,name:1,first_name:1,last_name:1,logo:1,designation:1,isLoungeUser:1,isChatUser:1})

      const avaiLoungeSeat = await loungeModel.findById({ _id: req.body._id })
      if (userDetails.isLoungeUser==true) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'u_alr_jnlng', { status: 0 })
      }
      if (avaiLoungeSeat.type=="2") {
        if (avaiLoungeSeat.seats.seat1 &&  avaiLoungeSeat.seats.seat2) {
          const loungeOccup = await loungeModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
            isOccupLounge : true
          }, { new: true });
          await loungeOccup.save()
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_avai', { status: 0 })
        }
      }
      if (avaiLoungeSeat.type=="4") {
        if (avaiLoungeSeat.seats.seat1 &&  avaiLoungeSeat.seats.seat2 && avaiLoungeSeat.seats.seat3 && avaiLoungeSeat.seats.seat4) {
          const loungeOccup = await loungeModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
            isOccupLounge : true
          }, { new: true });
          await loungeOccup.save()
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_avai', { status: 0 })
        }
      }
      if (avaiLoungeSeat.type=="6") {
        if (avaiLoungeSeat.seats.seat1 &&  avaiLoungeSeat.seats.seat2 && avaiLoungeSeat.seats.seat3 && avaiLoungeSeat.seats.seat4 && avaiLoungeSeat.seats.seat5 && avaiLoungeSeat.seats.seat6) {
          const loungeOccup = await loungeModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
            isOccupLounge : true
          }, { new: true });
          await loungeOccup.save()
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_avai', { status: 0 })
        }
      }
      if (avaiLoungeSeat.type=="8") {
        if (avaiLoungeSeat.seats.seat1 &&  avaiLoungeSeat.seats.seat2 && avaiLoungeSeat.seats.seat3 && avaiLoungeSeat.seats.seat4 && avaiLoungeSeat.seats.seat5 &&  avaiLoungeSeat.seats.seat6 && avaiLoungeSeat.seats.seat7 && avaiLoungeSeat.seats.seat8) {
          const loungeOccup = await loungeModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
            isOccupLounge : true
          }, { new: true });
          await loungeOccup.save()
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'n_avai', { status: 0 })
        }
      }

      let isSeatAvailable;
      for(let i=0;i<Object.keys(avaiLoungeSeat.seats).length;i++){
        let key=Object.keys(avaiLoungeSeat.seats)[i]
        isSeatAvailable = avaiLoungeSeat.seats[key]
        if(!isSeatAvailable){
          avaiLoungeSeat.seats[key]=userDetails
          break;
        }
      }

      const user = await userModel.findByIdAndUpdate({ _id: req.body.userId , eventId : req.body.eventId}, {
        isLoungeUser : true
      }, { new: true });
      await user.save()
      socket.emit("joinLounge", avaiLoungeSeat)

      if(isSeatAvailable){
        avaiLoungeSeat.save()
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: avaiLoungeSeat })
      }else{
        avaiLoungeSeat.save()
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: avaiLoungeSeat })
      }
    } catch (error) {
        return catchError('Lounge.isJoinLounge', error, req, res)
    }
  }

  async joinedFromZoom(req, res) {
    try {
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkltWmxRbk0zU0YyazRsN1JHREVSQlEiLCJleHAiOjE3MDQwMDgyMjAsImlhdCI6MTY2NzM3MDY1M30.HJLczUTNgouLhmlzKMFu2upI11696pL_-uJWgUSu2MA";
      const id = req.body.payload.object.id; // "85619869453";
      const result = await axios.get("https://api.zoom.us/v2/meetings/" + id , {
        headers: {
          'Authorization': 'Bearer ' + token,          
        }
      });

      const userLounge = await loungeModel.findOne( { zoom_link: result?.data?.join_url});
      if(userLounge){
        let seats=Object.keys(userLounge.seats);
        seats.forEach(seat => {
          if(userLounge?.seats[seat] != ''){
            let tempSeat = userLounge.seats[seat];
            if (typeof tempSeat.meetingId === 'undefined'){
              userLounge.seats[seat].meetingId = id;
              userLounge.seats[seat].userId = req.body.payload.object.participant.user_id;
            }
          }
        });
      }

      const newRecord = await loungeModel.findByIdAndUpdate({ _id: userLounge._id}, {
        seats : userLounge.seats
      }, { new: true });
      await newRecord.save();

      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1 })
    } catch (error) {
        return catchError('Lounge.joinedFromZoom', error, req, res)
    }
  }

  async leaveFromZoom(req, res) {
    try {
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkltWmxRbk0zU0YyazRsN1JHREVSQlEiLCJleHAiOjE3MDQwMDgyMjAsImlhdCI6MTY2NzM3MDY1M30.HJLczUTNgouLhmlzKMFu2upI11696pL_-uJWgUSu2MA";
      // console.log("userId", req.body.payload.object.participant.user_id);
      // console.log("meetingId", req.body.payload.object.id);
      let userId = req.body.payload.object.participant.user_id;
      
      const userLounge = await loungeModel.findOne({$or: [
        { 'seats.seat1.userId': userId},
        { 'seats.seat2.userId': userId},
        { 'seats.seat3.userId': userId},
        { 'seats.seat4.userId': userId},
        { 'seats.seat5.userId': userId},
        { 'seats.seat6.userId': userId},
        { 'seats.seat7.userId': userId},
        { 'seats.seat8.userId': userId}
      ]});

      let leavedUserId = false;
      if(userLounge){
        let seats=Object.keys(userLounge.seats);
        seats.forEach(seat => {
          if(userLounge?.seats[seat] != ''){
            let tempSeat = userLounge.seats[seat];
            if (typeof tempSeat.userId !== 'undefined' && tempSeat.userId == userId){
              userLounge.seats[seat] = '';
              leavedUserId = tempSeat._id
            }
          }
        });
      }

      const newRecord = await loungeModel.findByIdAndUpdate({ _id: userLounge._id}, {
        seats : userLounge.seats
      }, { new: true });
      await newRecord.save();
      socket.emit("exitLounge", newRecord);

      await userModel.findByIdAndUpdate({ _id: leavedUserId , eventId : userLounge.eventId}, {
        isLoungeUser : false
      }, { new: true });

      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1 })
    } catch (error) {
        return catchError('Lounge.joinedFromZoom', error, req, res)
    }
  }

  async isExitFromLounge(req, res) {
    try {
      const userLounge = await loungeModel.find( {_id: req.body._id})
      let seats={}
      let seatKeys=Object.keys(userLounge[0]?.seats)
      let seatValues=Object.values(userLounge[0]?.seats)
      const userIndex = seatValues.findIndex((item) => {
        
        return JSON.stringify(item._id) === JSON.stringify(req.body.userId)});
      seatValues[userIndex]=""

      seatKeys.map((item,index)=>{
        seats[item]=seatValues[index]
      })

        const lounge = await loungeModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
          seats:seats,
        }, { new: true });
        const user = await userModel.findByIdAndUpdate({ _id: req.body.userId , eventId : req.body.eventId}, {
          isLoungeUser : false
        }, { new: true });
        await lounge.save()
        await user.save();
        socket.emit("exitLounge", lounge);
        return response(req, res, status.OK, jsonStatus.OK, 'ex_lng', { status: 1, data: lounge })
    } catch (error) {
        return catchError('Lounge.isExitFromLounge', error, req, res)
    }
  }

  async availLoungeOnOrg (req, res) {
    try {
      const loungeType2 = await loungeModel.find({
        organizationId : req.body.organizationId,
        eventId : req.body.eventId,
        type : "2",
      }).count();
      const loungeType4 = await loungeModel.find({
        organizationId : req.body.organizationId,
        eventId : req.body.eventId,
        type : "4",
      }).count();
      const loungeType6 = await loungeModel.find({
        organizationId : req.body.organizationId,
        eventId : req.body.eventId,
        type : "6",
      }).count();
      const loungeType8 = await loungeModel.find({
        organizationId : req.body.organizationId,
        eventId : req.body.eventId,
        type : "8",
      }).count();
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {loungeType2:loungeType2, loungeType4:loungeType4, loungeType6:loungeType6, loungeType8:loungeType8} })
    } catch (error) {
      return catchError('Lounge.availLoungeOnOrg', error, req, res)
    }
  }

}

module.exports = new Lounge()