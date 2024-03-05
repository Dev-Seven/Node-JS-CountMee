const bcrypt = require('bcrypt')
const moment = require('moment')
const validator = require('validator')
var jwt = require("jsonwebtoken")
var multer = require('multer')
const fs = require("fs")
const express = require("express")
const csv = require("fast-csv")
const mongoose = require('mongoose');
const axios = require('axios');
// var csv = require('csvtojson')


const { catchError, pick, response, genJwtHash, generateRandomPassword, hashPassword, sendPushNotification, sendEmailCred, sendEmailCredNodem, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const {logger} = require("../services/logger")
const { eventModel } = require('../models/event')
const { customFormModel } = require('../models/customForm')
const { eventFeedModel } = require('../models/eventFeed')
const { eveFeedCmntModel } = require('../models/eveFeedCmnt')
const { expoModel } = require('../models/expo')
const { informationDeskModel } = require('../models/informationDesk')
const { loungeModel } = require('../models/lounge')
const { notificationModel } = require('../models/notification')
const { partnerModel } = require('../models/partner')
const { sponsorCollModel } = require('../models/sponsorColl')
const { scheduleModel } = require('../models/schedule')
const { speakerModel } = require('../models/speaker')
const { speakerCollModel } = require('../models/speakerColl')
const { sponsorModel } = require('../models/sponsor')
const { stageModel } = require('../models/stage')
const { userRegEventModel } = require('../models/userRegEvent')
const { userEventDetailModel } = require('../models/userEventDetail')
const { organizationModel } = require('../models/organization')
const { sessionModel } = require('../models/session')
const { userModel } = require('../models/user')
const { zoomModel } = require('../models/zoom') 
const { zmKeyModel } = require('../models/zmKey')
const { compareSync } = require('bcrypt')
const { type } = require('express/lib/response')
const bcryptSalt = bcrypt.genSaltSync(9)
const socket = require('../services/socket')

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/files')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });
class Event {
  async createEvent(req, res) {
    try {
      // const starts_at = new Date(req.body.starts_at); //cmnt for serverTime msmtc
      // const ends_at = new Date(req.body.ends_at);
      const starts_at = req.body.starts_at
      const ends_at = req.body.ends_at
      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();
      const date = moment(new Date(req.body.starts_at)).format("YYYY-MM-DD");
      const starts_at_m = moment(new Date(req.body.starts_at)).format("DD/MM/YYYY HH:mm:ss")
      const ends_at_m = moment(new Date(req.body.ends_at)).format("DD/MM/YYYY HH:mm:ss")
      // console.log({ date})
      let custom_url = req.body.custom_url.split(' ').join('-');
      const event = new eventModel({
        organizationId : req.body.organizationId, // this is userid
        name: req.body.name,
        description : req.body.description,
        starts_at: starts_at,
        ends_at : ends_at,
        timezone : req.body.timezone,
        custom_url : custom_url,
        url_type : req.body.url_type,
        communication : req.body.communication,
        stage : req.body.stage,
        sessions : req.body.sessions,
        networking : req.body.networking,
        expo : req.body.expo,
        theme_colorone : req.body.theme_colorone,
        theme_colortwo : req.body.theme_colortwo,
        facebook : req.body.facebook,
        twitter : req.body.twitter,
        youtube : req.body.youtube,
        instagram : req.body.instagram,
        linkedin : req.body.linkedin,
        contentUrl : req.body.contentUrl,
        date: date, 
        starts_at_m : starts_at_m,
        ends_at_m : ends_at_m
      })
      // const organization = new organizationModel({
      //   _id : req.body.organizationId
      // })

      const organization = await userModel.findById({
        _id : req.body.organizationId
      })

      // var organizationDetails;
      // console.log(organization, "organization")
      // if(organization) {
      //   organizationDetails = ` ${organization.name} `;
      // }
      logger.error(`You are passing wrong organizationId at`)
      const descr = event.name + " has been created by " + organization.name;     
      const notification = await new notificationModel({
        // organizationId : req.body.organizationId,
        // name : req.body.name,
        description: descr,
      })
      // socket.emit("notifications", notification);
      const organizationId = req.body.organizationId;
      const name = req.body.name;
      const existingEventName = await eventModel.find({ organizationId, name, starts_at, ends_at });
      // console.log('existingEventName', existingEventName)
      if (existingEventName.length) {
            if (existingEventName.organizationId === req.body.organizationId && existingEventName.starts_at === starts_at && existingEventName.name === req.body.name && existingEventName.ends_at === ends_at ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'name_cnt_24h')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'event_name_cnt_24h')
          }
        }
      const existingEventDate = await eventModel.find({ organizationId, name, date });
      if (existingEventDate.length) {
          if (existingEventDate.organizationId === req.body.organizationId && existingEventDate.date === date ) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'date_cnt_24h')
        } else {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'date_nm_cnt_24h')
        }
      }
      const existingEvent = await eventModel.find({ organizationId, starts_at, ends_at });
      // console.log('existingEvent', existingEvent)
      if (existingEvent.length) {
            if (existingEvent.organizationId === req.body.organizationId && existingEvent.starts_at === starts_at && existingEvent.ends_at === ends_at) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'already_sch')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'event_already_sch')
          }
        }

      if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
      if (starts_at_m >= ends_at_m) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
      socket.emit("notifications", notification);
      if (req.files) {
        let banner = "";
        let logo = "";
        let eve_logo_sly = "";
        // req.files.forEach(function(files, index, arr){
        //   path = path + files.path + ','
        // })
        // path = path.substring(0, path.lastIndexOf(","))
      
        req.files["banner"].forEach(function (files, index, arr) {
          banner = banner + files.path + ",";
        });
        banner = banner.substring(0, banner.lastIndexOf(","));
      
        req.files["logo"].forEach(function (files, index, arr) {
          logo = logo + files.path + ",";
        });
        logo = logo.substring(0, logo.lastIndexOf(","));

        if (typeof req.files.eve_video !== 'undefined' && req.files.eve_video.length > 0) {                
          event.eve_video = req.files.eve_video[0].path
        }
        if ( typeof req.body.eve_video !== 'undefined' && req.body.eve_video )
        {
            event.eve_video = req.body.eve_video; 
        }

        if (typeof req.files.eve_login_banner !== 'undefined' && req.files.eve_login_banner.length > 0) {                
          event.eve_login_banner = req.files.eve_login_banner[0].path
        }
        if ( typeof req.body.eve_login_banner !== 'undefined' && req.body.eve_login_banner )
        {
            event.eve_login_banner = req.body.eve_login_banner; 
        }

        req.files["eve_logo_sly[]"].forEach(function (files, index, arr) {
          eve_logo_sly = eve_logo_sly + files.path + ",";
        });
        eve_logo_sly = eve_logo_sly.substring(0, eve_logo_sly.lastIndexOf(","));


        // if (typeof req.files !== 'undefined' && req.files.length > 0) {            //banner replace or pass str & for null pass
        //   event.eve_logo_sly = req.files[0].path
        // }
        // if ( typeof req.body.eve_logo_sly !== 'undefined' && req.body.eve_logo_sly )
        // {
        //   event.eve_logo_sly = req.body.eve_logo_sly; 
        // }
      
        // event.banner = banner.split(","); //for arr
        // event.logo = logo.split(",");     
        event.banner = banner;              //for str
        event.logo = logo;
        event.eve_logo_sly = eve_logo_sly.split(",");     
      }
      if(req.body.sessions =="true" || req.body.stage == "true") {
        event.save();
        await notification.save()
        return response(req, res, status.Create, jsonStatus.Create, 'event_create', { status: 1, data: event })
      }
      else {return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'missing')}
      // event.save()
      // await notification.save()
      // return response(req, res, status.Create, jsonStatus.Create, 'event_create', { status: 1, data: event })
    } catch (error) {  
    return catchError('Event.createEvent', error, req, res)
    }
  }

  async editEvent(req, res) {
    try {
      // console.log('starts_at', req.body.starts_at);
      // const starts_at = new Date(req.body.starts_at);
      // const ends_at = new Date(req.body.ends_at);
      const starts_at = req.body.starts_at
      const ends_at = req.body.ends_at
      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();
      const date = moment(new Date(req.body.starts_at)).format("YYYY-MM-DD");
      const starts_at_m = moment(new Date(req.body.starts_at)).format("DD/MM/YYYY HH:mm:ss")
      const ends_at_m = moment(new Date(req.body.ends_at)).format("DD/MM/YYYY HH:mm:ss")
      let updateData = {
        name: req.body.name,
        description : req.body.description,
        timezone : req.body.timezone,
        custom_url : req.body.custom_url,
        url_type : req.body.url_type,
        communication : req.body.communication,
        stage : req.body.stage,
        sessions : req.body.sessions,
        networking : req.body.networking,
        expo : req.body.expo,
        theme_colorone : req.body.theme_colorone,
        theme_colortwo : req.body.theme_colortwo,
        facebook : req.body.facebook,
        twitter : req.body.twitter,
        youtube : req.body.youtube,
        instagram : req.body.instagram,
        linkedin : req.body.linkedin,
        contentUrl : req.body.contentUrl,
        starts_at_m : starts_at_m,
        ends_at_m : ends_at_m,
        status: 1,
      }

      if (typeof req.body.starts_at !== "undefined") {
        updateData.starts_at = starts_at;
        updateData.date = date;
      }

      if (typeof req.body.ends_at !== "undefined") {
        updateData.ends_at = ends_at;
      }
    
      const event = await eventModel.findByIdAndUpdate( req.body.event_id, updateData, {new: true });

      const organization = await userModel.findById({
        _id : req.body._id
      })

      // var organizationDetails;
      // console.log(organization, "organization")
      // if(organization) {
      //   organizationDetails = ` ${organization.name} `;
      // }
      const descr = event.name + " has been edited by " + organization.name;     
      const notification = await new notificationModel({
        // organizationId : req.body.organizationId,
        // name : req.body.name,
        description: descr,
        status : 2
      })
      socket.emit("notifications", notification);
      // const starts_at = new Date(req.body.starts_at);
      // const ends_at = new Date(req.body.ends_at);
      const organizationId = req.body.organizationId;
      const name = req.body.name;
      const existingEventName = await eventModel.find({ organizationId, name, starts_at, ends_at });
      // console.log('existingEventName', existingEventName)
      if (existingEventName.length) {
            if (existingEventName.organizationId === req.body.organizationId && existingEventName.starts_at === starts_at && existingEventName.name === req.body.name && existingEventName.ends_at === ends_at ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'name_cnt_24h')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'event_name_cnt_24h')
          }
        }
      const existingEventDate = await eventModel.find({ organizationId, name, date });
      if (existingEventDate.length) {
          if (existingEventDate.organizationId === req.body.organizationId && existingEventDate.date === date ) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'date_cnt_24h')
        } else {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'date_nm_cnt_24h')
        }
      }
      const existingEvent = await eventModel.find({ organizationId, starts_at, ends_at });
      if (existingEvent.length) {
            if (existingEvent.organizationId === req.body.organizationId && existingEvent.starts_at === req.body.starts_at && existingEvent.ends_at === req.body.ends_at) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'already_sch')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'event_already_sch')
          }
        }
        if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
        if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
        if (starts_at_m >= ends_at_m) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
        // console.log('banner', req.body.banner);
        // let eventBanners = [];
        // if(req.files){
        //   // console.log('file', req.files)
        //   let path = ''
        //   req.files.forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   eventBanners = path.split(",")
        // }

        // if(Array.isArray(req.body.banner)){
        //   if(eventBanners.length > 0 && eventBanners[0] != ''){
        //     event.banner = eventBanners.concat(req.body.banner);
        //   } else {
        //     event.banner = req.body.banner;
        //   }
        // } else {
        //   if(eventBanners.length > 0 && eventBanners[0] != ''){
        //     event.banner = eventBanners;
        //   } else {
        //     event.banner = null;
        //   }
        // }
        // // console.log('event.banner', event.banner);
        

        // let eventBanners = [];
        // let eventLogos = [];
  
        // console.log('file', req.files)
        // if(req.files["banner[]"]){    //cmnt for arr
        //   console.log('file', req.files)
        //   let path = ''
        //   req.files["banner[]"].forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   eventBanners = path.split(",")
        // }
  
        // if(Array.isArray(req.body.banner)){
        //   console.log('insideif')
        //   if(eventBanners.length > 0 && eventBanners[0] != ''){
        //     event.banner = eventBanners.concat(req.body.banner);
        //   } else {
        //     event.banner = req.body.banner;
        //   }
        // } else {
        //   if(eventBanners.length > 0 && eventBanners[0] != ''){
        //     event.banner = eventBanners;
        //   } else {
        //     event.banner = null;
        //   }
        // }
        // console.log('event.banner', event.banner);

        // console.log('fileLL', req.files)
        // if(req.files["logo[]"]){   //cmnt for arr
        //   // console.log('file', req.files)
        //   let path = ''
        //   req.files["logo[]"].forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   eventLogos = path.split(",")
        // }
  
        // if(Array.isArray(req.body.logo)){
        //   console.log('insideif')
        //   if(eventLogos.length > 0 && eventLogos[0] != ''){
        //     event.logo = eventLogos.concat(req.body.logo);
        //   } else {
        //     event.logo = req.body.logo;
        //   }
        // } else {
        //   if(eventLogos.length > 0 && eventLogos[0] != ''){
        //     event.logo = eventLogos;
        //   } else {
        //     event.logo = null;
        //   }
        // }
        // console.log('event.logo', event.logo);

        // console.log(req.files);

        if (typeof req.files.banner !== 'undefined' && req.files.banner.length > 0) {            //banner replace or pass str 
          event.banner = req.files.banner[0].path
        }
        if ( typeof req.body.banner !== 'undefined' && req.body.banner )
        {
          event.banner = req.body.banner; 
        }

        if (typeof req.files.logo !== 'undefined' && req.files.logo.length > 0) {            //logo replace or pass str 
          event.logo = req.files.logo[0].path
        }
        if ( typeof req.body.logo !== 'undefined' && req.body.logo )
        {
          event.logo = req.body.logo; 
        }

        if (typeof req.files.eve_video !== 'undefined' && req.files.eve_video.length > 0) {                
          event.eve_video = req.files.eve_video[0].path
        }
        if ( typeof req.body.eve_video !== 'undefined' && req.body.eve_video )
        {
            event.eve_video = req.body.eve_video; 
        }

        if (typeof req.files.eve_login_banner !== 'undefined' && req.files.eve_login_banner.length > 0) {                
          event.eve_login_banner = req.files.eve_login_banner[0].path
        }
        if ( typeof req.body.eve_login_banner !== 'undefined' && req.body.eve_login_banner )
        {
            event.eve_login_banner = req.body.eve_login_banner; 
        }

        let eventLogoSly = [];
        // console.log('eve_logo_sly', req.files)
        if(req.files["eve_logo_sly[]"]){
          // console.log('file', req.files)
          let path = ''
          req.files["eve_logo_sly[]"].forEach(function(files, index, arr){
            path = path + files.path + ','
          })
          path = path.substring(0, path.lastIndexOf(","))
          eventLogoSly = path.split(",")
        }
  
        if(Array.isArray(req.body.eve_logo_sly)){
          console.log('insideif')
          if(eventLogoSly.length > 0 && eventLogoSly[0] != ''){
            event.eve_logo_sly = eventLogoSly.concat(req.body.eve_logo_sly);
          } else {
            event.eve_logo_sly = req.body.eve_logo_sly;
          }
        } else {
          if(eventLogoSly.length > 0 && eventLogoSly[0] != ''){
            event.eve_logo_sly = eventLogoSly;
          } else {
            event.eve_logo_sly = null;
          }
        }
        // console.log('event.eve_logo_sly', event.eve_logo_sly);
        if(req.body.sessions =="true" || req.body.stage == "true") {
          event.save();
          await notification.save()
          return response(req, res, status.Create, jsonStatus.Create, 'event_create', { status: 1, data: event })
        }
        else {return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'missing')}
      // event.save()
      // await notification.save()
      // return response(req, res, status.OK, jsonStatus.OK, 'event_updated', { status: 1, data: event })
    } catch (error) {  
    return catchError('Event.editEvent', error, req, res)
    }
  }

  async approveEvent(req, res) {
    try {
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const event = await eventModel.findByIdAndUpdate( req.body.eventId, {
          superAdminId : req.body.superAdminId,
          isActive: true,
          isDecline : false,
        }, {new: true });
        var topic =
        "epitome-voe-notifications-" + event;
        var pushmessage = "Your event has been approved successfully";
        var title = process.env.SITE_NAME;
        let data = {
          type: "eventrequest",
        };
        sendPushNotification(pushmessage, title, topic, data);
        await event.save()
        return response(req, res, status.OK, jsonStatus.OK, 'event_approved', { status: 1, data: event })
      } else{
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Event.approveEvent', error, req, res)
    }
  }

  async declineEvent(req, res) {
    try { 
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const event = await eventModel.findByIdAndUpdate( req.body.eventId, {
          superAdminId : req.body.superAdminId,
          isDecline: true,
          isActive: false,
        }, {new: true });
        var topic =
        "epitome-voe-notifications-" + event;
        var pushmessage = "Your event has been declined";
        var title = process.env.SITE_NAME;
        let data = {
          type: "eventrequest",
        };
        sendPushNotification(pushmessage, title, topic, data);
        await event.save()
        return response(req, res, status.OK, jsonStatus.OK, 'event_dec', { status: 1, data: event })
      } else{
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
    return catchError('Event.declineEvent', error, req, res)
    }
  }

  async allEvent (req, res) {
    try {
      const events = await eventModel.find( { status : [ 1 ] } ).sort({_id:-1});
      // const events = await eventModel.find( { status : [ 1 ] } ).sort({createdAt:1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: events })
    } catch (error) {
      return catchError('Event.allEvent', error, req, res)
    }
  }

  async allDeletedEvent (req, res) {
    try {
      const events = await eventModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: events })
    } catch (error) {
      return catchError('Event.allDeletedEvent', error, req, res)
    }
  }

  async eventsByOrg (req, res, next) {
    try {
      const events = await eventModel.find( { status : [ 1 ] , organizationId : req.body.organizationId } ).sort({_id:-1});
      // const events = await eventModel.find( { status : [ 1 ] , organizationId : req.body.organizationId } ).sort({createdAt:-1});
      if (!events) return next(new Error('Event does not exist with above organizationId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: events })
    } catch (error) {
      return catchError('Event.eventsByOrg', error, req, res)
    }
  }

  async eventById (req, res , next)  {
  try {
    const eventId = req.body.id;
    const event = await eventModel.findById(eventId);
    if (!event) return next(new Error('Event does not exist'));
    return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: event })
  } catch (error) {  
    return catchError('Event.eventById', error, req, res)
    }
  }

  async eventByCode (req, res ) {    
    try {  
      const event = await eventModel.find( { status : [ 1 ] , custom_url : req.body.code } ).sort({_id:-1});
      var speakers = await speakerModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < speakers.length; i++) {
        // const schedule = await sessionModel.find( {eventId: event[0]._id.toString(), status : 1, schedSpeakers: { $eq: speakers[i]._id.toString() }} ).sort({date:1}); ////coll change for scheduled speakers
        const schedule = await sessionModel.find( {eventId: event[0]._id.toString(), status : 1, schedSpeakers: { $elemMatch: { _id :speakers[i]._id}}} ).sort({date:1}); //coll change for scheduled speakers
        speakers[i].schedules = schedule;
      }

      const partners = await partnerModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < partners.length; i++) {
        const schedule = await scheduleModel.find( {eventId: event[0]._id.toString(), scheduledSpeakers: { $eq: partners[i]._id.toString() }} ).sort({date:1});    
        partners[i].schedules = schedule;
      }

      /*
      // const partners = await partnerModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1});
      const sponsors = await sponsorModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < sponsors.length; i++) {
        const schedule = await scheduleModel.find( {eventId: event[0]._id.toString(), scheduledSpeakers: { $eq: sponsors[i]._id.toString() }} ).sort({date:1});    
        sponsors[i].schedules = schedule;
      }
      */

      const sponsors = await sponsorModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < sponsors.length; i++) {
        // const schedule = await sessionModel.find( {eventId: event[0]._id.toString(), status : 1, schedSponsors: { $eq: sponsors[i]._id.toString() }} ).sort({date:1}); ////coll change for scheduled sponsors
        const schedule = await sessionModel.find( {eventId: event[0]._id.toString(), status : 1, schedSponsors: { $elemMatch: { _id :sponsors[i]._id}}} ).sort({date:1}); //coll change for scheduled sponsors
        sponsors[i].schedules = schedule;
      }

      // const eveSpeaker = await speakerModel.find( { status : [ 1 ] , eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();
      const eveSpeaker = await speakerModel.find( { status : [ 1 ] , eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < eveSpeaker.length; i++) {
        const schedule = await sessionModel.find( {eventId: event[0]._id.toString(), status : 1, schedSpeakers: { $elemMatch: { _id :eveSpeaker[i]._id}}} ).sort({date:1}); //coll change for scheduled speakers
        // console.log('schedule', schedule)
        // console.log('eveSpeaker', eveSpeaker[i]._id.toString())
        eveSpeaker[i].schedules = schedule;
      }



      // const speakerStage = await speakerModel.find( { status : [ 1 ], eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      // for (let i = 0; i < speakerStage.length; i++) {
      //   const stage = await stageModel.find( {eventId: event[0]._id.toString(), status : 1, schedSpeakers: { $eq: speakerStage[i]._id.toString() }} ).sort({starts_at:-1}); 
      //   speakerStage[i].stages = stage;
      // }


      const speakerStage = await stageModel.find( { status : [ 1 ], eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < speakerStage.length; i++) {
        const stage = await speakerModel.find( {eventId: event[0]._id.toString(), status : 1, schedSpeakers: { $eq: speakerStage[i]._id.toString() }} ).sort({id:-1}); 
        speakerStage[i].stageSpeakers = stage;
      }

      const expo = await expoModel.find( { status : [ 1 ] , eventId : event[0]._id.toString() } ).sort({_id:-1});
      // const session = await sessionModel.find( { status : [ 1 ] , eventId : event[0]._id.toString() } ).sort({_id:-1});

      const speakerColl = await speakerCollModel.find({});

      const newSpeakeCategory = {};
      let catagory = [];
      for(let i = 0; i < speakerColl.length; i++) {
        catagory.push(speakerColl[i].categoryName)
        // for(let j = 0; j < speakerGoldCategoryDup.length; j++) {

        //   if (speakerColl[i].categoryName == speakerGoldCategoryDup[j].speaker_list) {
        //     // console.log(speakerColl[i].categoryName, "dfdf");
        //     speakerCategoryList=speakerColl[i].categoryName
        //   }
        //   if(speakerColl[i].categoryName != speakerGoldCategoryDup[j].speaker_list) {


        //     // if(speakerColl[i].categoryName){

        //     // }

        //     speakerCategoryList=speakerColl[i].categoryName ;
        //     console.log("hello if : ",speakerCategoryList );
        //     // speakerCategoryList=speakerGoldCategoryDup[j].speaker_list ;

        //     // console.log(speakerColl[i].categoryName,"cetName");
        //     // console.log(speakerGoldCategoryDup[j].speaker_list,"spelist");
        //   }
        // }
      }
      console.log(event[0]._id.toString(),"event[0]._id.toString()");

      for (let item = 0; item < catagory.length; item++) {
        cat(catagory[item])
        // console.log("cat:",catagory[item]);
      }
        //  console.log("event id sorting:", eventSortiing[0] );
      async function cat (item) {
        const speakerGoldCategory = await speakerModel.find({
          speaker_list : item,
          //status : [0,1],
          eventId : event[0]._id.toString()
         }).sort({_id:-1});
        //  temArray.push([speakerGoldCategory.speaker_list] : speakerGoldCategory)
        // console.log("new speaker:", speakerGoldCategory);
        if(speakerGoldCategory.length){
          // newSpeakeCategory.push({[item]:speakerGoldCategory})
          newSpeakeCategory[item] = speakerGoldCategory;
        }
      }

      // const sponsorColl = await sponsorCollModel.find({});
      const sponsorColl = await sponsorCollModel.aggregate([{ $sort: {sequence: 1}}]);

      const newSponsorCategory = {};
      let spoCatagory = [];
      for(let i = 0; i < sponsorColl.length; i++) {
        spoCatagory.push(sponsorColl[i].categoryName)
        
      }

      for (let item = 0; item < spoCatagory.length; item++) {
        await spoCat(spoCatagory[item])
        // console.log("cat:",catagory[item]);
      }
        //  console.log("event id sorting:", eventSortiing[0] );
      async function spoCat (item) {
        const sponsorGoldCategory = await sponsorModel.find({
          sponsor_list : item,
          // status : [0,1],
          eventId : event[0]._id.toString()
         }).sort({_id:-1});
        //  newSponsorCategory.push({item:sponsorGoldCategory})
        newSponsorCategory[item] = sponsorGoldCategory;

      }
      const sessionUser = await userModel.find({eventId : event[0]._id.toString(),role: 'user', status: 1}).sort({});      
      // const session = await sessionModel.find({eventId : event[0]._id.toString()}).sort({"date":1});
      const sessionD = await sessionModel.find({eventId : event[0]._id.toString()});
      const session  = sessionD.sort((a, b) => moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY')))

      const newSessionDateCategory = {};
      let sessionCatagory = [];
      for(let i = 0; i < session.length; i++) {
        sessionCatagory.push(session[i].date)
      }
      for (let item = 0; item < sessionCatagory.length; item++) {
        await sessionDateCat(sessionCatagory[item])
      }
      async function sessionDateCat (item) {
        const sessionDateCategory = await sessionModel.find({
          date : item,
          status : [0,1], //uncmnt for active session
          eventId : event[0]._id.toString()
         }).sort({sessionTime:1});
        newSessionDateCategory[item] = sessionDateCategory;
      }

      var sessionSpeakers = await speakerModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();
      for (let i = 0; i < sessionSpeakers.length; i++) {
        const sessionSpe = await sessionModel.find( {eventId: event[0]._id.toString(), schSessionSpeakers: { $eq: sessionSpeakers[i]._id.toString() }} ).sort({date:1});    
        sessionSpeakers[i].sessionSpeakers = sessionSpe;
      }

      var sessionSponsors = await sponsorModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();

      for (let i = 0; i < sessionSponsors.length; i++) {
        const sessionSpo = await sessionModel.find( {eventId: event[0]._id.toString(), schSessionSponsors: { $eq: sessionSponsors[i]._id.toString() }} ).sort({date:1});    
        sessionSponsors[i].sessionSponsors = sessionSpo;
      }

      const eveLounge = await loungeModel.find({eventId : event[0]._id.toString(), status:1}).sort({_id:1});
      socket.emit("eveLounge", eveLounge);

      var isFeaturedSpeaker = await speakerModel.find( { status : [ 1 ] , isFeatured : true, eventId : event[0]._id.toString() } ).sort({_id:-1}).lean();
      for (let i = 0; i < isFeaturedSpeaker.length; i++) {
        const schedule = await scheduleModel.find( {eventId: event[0]._id.toString(), scheduledSpeakers: { $eq: isFeaturedSpeaker[i]._id.toString() }} ).sort({date:1});    
        isFeaturedSpeaker[i].schedules = schedule;
      }

       const isFeaturedSponsor = await sponsorModel.find({
        isFeatured : "true",
        status : [0,1],
        eventId : event[0]._id.toString()
       }).sort({_id:-1});       
       
      //  return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {event:event, speakers:speakers, partners:partners, sponsors:sponsors, expo: expo, session: session, speakerCategory : {[speakerCategoryList]:speakerGoldCategory, Silver:speakerSilverCategory, Platinium:speakerPlatinumCategory}, sponsorCategory : {Gold:sponsorGoldCategory, Silver:sponsorSilverCategory, Platinium:sponsorPlatiniumCategory}, isFeaturedSpeaker:isFeaturedSpeaker, isFeaturedSponsor:isFeaturedSponsor}})
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {event:event, speakers:speakers, Stage:speakerStage, partners:partners, sponsors:sponsors, expo: expo, eveSpeaker: eveSpeaker, session: newSessionDateCategory,  sessionUser : sessionUser, speakerCategory : newSpeakeCategory, sponsorCategory : newSponsorCategory, isFeaturedSpeaker:isFeaturedSpeaker, isFeaturedSponsor:isFeaturedSponsor, eveLounge:eveLounge}})
    } catch (error) {
      return catchError('Event.eventByCode', error, req, res)
    }
  }

  async eventDetailsByCode (req, res ) {    
    try {  
      // const speakers = await speakerModel.find( { status : [ 1 ] , code : req.body.code } ).populate({path: 'eventId', select: ['name', 'email']});
      const speakers = await speakerModel.find( { status : [ 1 ] , code : req.body.code } ).sort({_id:-1});
      const partners = await partnerModel.find( { status : [ 1 ] , code : req.body.code } ).sort({_id:-1});
      const sponsors = await sponsorModel.find( { status : [ 1 ] , code : req.body.code } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{speakers, partners, sponsors}] })
    } catch (error) {
      return catchError('Event.eventDetailsByCode', error, req, res)
    }
  }

  async totalEvents (req, res) {
    try {
      const events = await eventModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: events })
    } catch (error) {
      return catchError('Event.totalEvents', error, req, res)
    }
  }

  async speSpoExpoByEvent (req, res, next) {
    try {
      const speaker = await speakerModel.find({
        eventId : req.body.eventId,
        status : 1
      }).count();
      const sponsor = await sponsorModel.find({
        eventId : req.body.eventId,
        status : 1
      }).count();
      const expo = await expoModel.find({
        eventId : req.body.eventId,
        status : 1
      }).count();
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{speaker, sponsor, expo}] })
    } catch (error) {
      return catchError('Event.speSpoExpoByEvent', error, req, res)
    }
  }

  async speSpoExpoByEventN (req, res, next) {
    try {
      if(req.body.eventId != null){
        const speaker = await speakerModel.find({
          eventId : req.body.eventId
        }).count();
        const sponsor = await sponsorModel.find({
          eventId : req.body.eventId
        }).count();
        const expo = await expoModel.find({
          eventId : req.body.eventId
        }).count();
      } else {
        const totalOrganization = await organizationModel.find({
        }).count();
        const speaker = await speakerModel.find({
        }).count();
        const sponsor = await sponsorModel.find({
        }).count();
        const expo = await expoModel.find({
        }).count();
      }
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{speaker, sponsor, expo}] })
    } catch (error) {
      return catchError('Event.speSpoExpoByEventN', error, req, res)
    }
  }

  async speSpoExpoByAllEvent (req, res, next) {
    try {
      const event = await eventModel.find({
      }).count();
      const speaker = await speakerModel.find({
      }).count();
      const sponsor = await sponsorModel.find({
      }).count();
      const expo = await expoModel.find({
      }).count();
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{event: event, speaker: speaker, sponsor:sponsor, expo:expo}] })
    } catch (error) {
      return catchError('Event.speSpoExpoByAllEvent', error, req, res)
    }
  }

  async allOrgEveSpeSpoExpo (req, res, next) {
    try {
      let speaker=[];
      let sponsor=[];
      let expo=[];
      let sesion=[];




      if(req.body.organizationId !== "null" && req.body.eventId !== "null" ) {
        const organization = await organizationModel.find({
          organizationId : req.body.organizationId,
          status : [0,1]
       }).count();  
       const event = await eventModel.find({
         eventId : req.body.eventId,
         status : [0,1]
        }).count();
       const speaker = await speakerModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       }).count();
       const sponsor = await sponsorModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       }).count();
       const expo = await expoModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       }).count();
       const session = await sessionModel.find({
        eventId : req.body.eventId,
        session_type : "Session",
        status : [0,1]
       }).count();
       const stage = await stageModel.find({
        eventId : req.body.eventId,
        session_type : "Stage",
        status : [0,1]
       }).count();
       const lounge = await loungeModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       }).count();
       return response(req, res, status.OK, jsonStatus.OK, 'success1', { status: 1, data: [{ organization :1,event:1,speaker,sponsor, expo, session, stage, lounge}]})
      } else if (req.body.organizationId == "null" && req.body.eventId == "null") {
          const organization = await organizationModel.find({    
            status : [0,1]     
          }).count();
          const event = await eventModel.find({
            status : [0,1]
          }).count();
          const speaker = await speakerModel.find({
            status : [0,1]
          }).count();
          const sponsor = await sponsorModel.find({
            status : [0,1]
          }).count();
          const expo = await expoModel.find({
            status : [0,1]
          }).count();
          const session = await sessionModel.find({
            session_type : "Session",
            status : [0,1],
          }).count();
          const stage = await stageModel.find({
            session_type : "Stage",
            status : [0,1]
          }).count();
          const lounge = await loungeModel.find({
            status : [0,1]
          }).count();
          return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{organization: organization, event: event, speaker: speaker, sponsor:sponsor, expo: expo, session: session, stage: stage, lounge: lounge }]})
        } else if (req.body.organizationId !=="null" && req.body.eventId == "null") {
          const organization = await organizationModel.find({    
            organizationId: req.body.organizationId,
            status : [0,1] 
          }).count();
          const event = await eventModel.find({
            organizationId: req.body.organizationId,
            status : [0,1]
          }).sort({_id:-1});

          let eventIds = [];
          event.forEach(event => {
            eventIds.push(event._id);
          });


          const speaker = await speakerModel.find( { eventId: { $in: eventIds }, status : 1 }).count();
          // const speaker = await speakerModel.find( { eventId: { $in: eventIds } } && {status:1 }).count();
          // const sponsor = await sponsorModel.find( { eventId: { $in: eventIds } } && {status:1 }).count();
          // const expo = await expoModel.find( { eventId: { $in: eventIds } } && {status:1 }).count();
          // const session = await sessionModel.find( { eventId: { $in: eventIds } } && {status:1 }).count();

          const sponsor = await sponsorModel.find({ eventId: { $in: eventIds }, status : 1 }).count();
          const expo = await expoModel.find({ eventId: { $in: eventIds }, status : 1 }).count();
          const session = await sessionModel.find({ eventId: { $in: eventIds }, session_type: "Session", status : 1 }).count();
          const stage = await stageModel.find({ eventId: { $in: eventIds }, session_type: "Stage", status : 1 }).count();
          const lounge = await loungeModel.find({ eventId: { $in: eventIds }, status : 1 }).count();
          return response(req, res, status.OK, jsonStatus.OK, 'success3', { status: 1, data: [{ organization:1, event:eventIds.length, speaker:speaker, sponsor:sponsor, expo: expo, session: session, stage: stage, lounge: lounge }]})
        } 
      


    //   if(req.body.eventId == null){
    //     if (req.body.organizationId == null){
    //       const organization = await organizationModel.find({
    //         // organizationId : req.body.organizationId
    //      }).count();  
    //      const event = await eventModel.find({
    //      }).count();
    //      const speaker = await speakerModel.find({
    //      }).count();
    //      const sponsor = await sponsorModel.find({
    //      }).count();
    //      const expo = await expoModel.find({
    //      }).count();
    //      return response(req, res, status.OK, jsonStatus.OK, 'success1', { status: 1, data: [{organization, event, speaker,sponsor, expo}]})
    //     } else {
    //       const organization = await organizationModel.find({         
    //       }).count();
    //       const event = await eventModel.find({
    //       }).count();
    //       const speaker = await speakerModel.find({
    //       }).count();
    //       const sponsor = await sponsorModel.find({
    //       }).count();
    //       const expo = await expoModel.find({
    //       }).count();
    //       return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{organization, event, speaker, sponsor, expo}]})
    //     }        
    //   } else if (req.body.organizationId && req.body.eventId ) {
    //     const organization = await organizationModel.find({
    //        organizationId : req.body.organizationId
    //     }).count();  
    //     const event = await eventModel.find({
    //       eventId : req.body.eventId
    //     }).count();
    //     const speaker = await speakerModel.find({
    //       eventId : req.body.eventId
    //     }).count();
    //     const sponsor = await sponsorModel.find({
    //       eventId : req.body.eventId
    //     }).count();
    //     const expo = await expoModel.find({
    //       eventId : req.body.eventId
    //     }).count();
    //     return response(req, res, status.OK, jsonStatus.OK, 'success3', { status: 1, data: [{organization, event, speaker,sponsor, expo}]})
    //   // } 
    // } else if (req.body.organizationId && req.body.eventId == null ) {
    //   const organization = await organizationModel.find({
    //      organizationId : req.body.organizationId
    //   }).count();  
    //   const event = await eventModel.find({
    //     // eventId : req.body.eventId
    //   }).count();
    //   const speaker = await speakerModel.find({
    //     // eventId : req.body.eventId
    //   }).count();
    //   const sponsor = await sponsorModel.find({
    //     // eventId : req.body.eventId
    //   }).count();
    //   const expo = await expoModel.find({
    //     // eventId : req.body.eventId
    //   }).count();
    //   return response(req, res, status.OK, jsonStatus.OK, 'success4', { status: 1, data: [{organization, event, speaker,sponsor, expo}]})
    // }
    } catch (error) {
      return catchError('Event.allOrgEveSpeSpoExpo', error, req, res)
    }
  }

  async allOrgEveSpeSpoExpoList (req, res, next) {
    try {
      let speaker=[];
      let sponsor=[];
      let expo=[];
      let session=[];




      if(req.body.organizationId !== "null" && req.body.eventId !== "null" ) {
        const organization = await organizationModel.find({
          organizationId : req.body.organizationId,
          status : [0,1]
       });  
       const event = await eventModel.find({
         eventId : req.body.eventId,
         status : [0,1]
        });
       const speaker = await speakerModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       const sponsor = await sponsorModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       const expo = await expoModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       const session = await sessionModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       const stage = await stageModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       const lounge = await loungeModel.find({
        eventId : req.body.eventId,
        status : [0,1]
       });
       return response(req, res, status.OK, jsonStatus.OK, 'success1', { status: 1, data: [{speaker,sponsor, expo, session, stage, lounge}]})
      } else if (req.body.organizationId == "null" && req.body.eventId == "null") {
          const organization = await organizationModel.find({    
            status : [0,1]     
          });
          const event = await eventModel.find({
            status : [0,1]
          });
          const speaker = await speakerModel.find({
            status : [0,1]
          });
          const sponsor = await sponsorModel.find({
            status : [0,1]
          });
          const expo = await expoModel.find({
            status : [0,1]
          });
          const session = await sessionModel.find({
            status : [0,1]
          });
          const stage = await stageModel.find({
            status : [0,1]
          });
          const lounge = await loungeModel.find({
            status : [0,1]
          });
          return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{organization: organization, event: event, speaker: speaker, sponsor:sponsor, expo: expo, session: session, stage: stage, lounge: lounge }]})
        } else if (req.body.organizationId !=="null" && req.body.eventId == "null") {
          const organization = await organizationModel.find({    
            organizationId: req.body.organizationId,
            status : [0,1] 
          });
          const event = await eventModel.find({
            organizationId: req.body.organizationId,
            status : [0,1]
          });

          let eventIds = [];
          event.forEach(event => {
            eventIds.push(event._id);
          });


          const speaker = await speakerModel.find( { eventId: { $in: eventIds }, status : [0,1] });
          const sponsor = await sponsorModel.find({ eventId: { $in: eventIds }, status : [0,1] });
          const expo = await expoModel.find({ eventId: { $in: eventIds }, status : [0,1] });
          const session = await sessionModel.find({ eventId: { $in: eventIds }, status : [0,1] });
          const stage = await stageModel.find({ eventId: { $in: eventIds }, status : [0,1] });
          const lounge = await loungeModel.find({ eventId: { $in: eventIds }, status : [0,1] });
          return response(req, res, status.OK, jsonStatus.OK, 'success3', { status: 1, data: [{ event:eventIds.length, speaker:speaker, sponsor:sponsor, expo: expo, session: session, stage: stage, lounge : lounge }]})
        } 
    } catch (error) {
      return catchError('Event.allOrgEveSpeSpoExpoList', error, req, res)
    }
  }

  async eveSpeSpoExpoByOrg (req, res, next) {
    try {
      if(req.body.organizationId !== "null"  && req.body.eventId !== "null") {
        const organization = await organizationModel.find({
          organizationId : req.body.organizationId
       }).count();  
       const event = await eventModel.find({
         eventId : req.body.eventId
       }).count();
       const speaker = await speakerModel.find({
        eventId : req.body.eventId
       }).count();
       return response(req, res, status.OK, jsonStatus.OK, 'success1', { status: 1, data: [{organization, event, speaker}]})
      } else {
          const organization = await organizationModel.find({   
            // organizationId : req.body.organizationId      
          }).count();
          const event = await eventModel.find({
            // eventId : req.body.eventId
          }).count();
          const speaker = await speakerModel.find({
            // eventId : req.body.eventId
          }).count();
          return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{organization, event, speaker}]})
        }  
    } catch (error) {
      return catchError('Event.eveSpeSpoExpoByOrg', error, req, res)
    }
  }

  async speakerByEventSa (req, res, next) {
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
        const speaker = await speakerModel.find( { eventId: { $in: eventIds }, status : 1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, speaker:speaker }]})
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
        const speaker = await speakerModel.find({
          eventId : req.body.eventId,
          status : [0,1]
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, speaker:speaker }]})
      }
    } catch (error) {
      return catchError('Event.speakerByEventSa', error, req, res)
    }
  }

  async sponsorByEventSa (req, res, next) {
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
        const sponsor = await sponsorModel.find( { eventId: { $in: eventIds }, status:1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, sponsor:sponsor }]})
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
        const sponsor = await sponsorModel.find({
          eventId : req.body.eventId,
          status : [0,1]
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, sponsor:sponsor  }]})
      }
    } catch (error) {
      return catchError('Event.sponsorByEventSa', error, req, res)
    }
  }

  async expoByEventSa (req, res, next) {
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
        const expo = await expoModel.find( { eventId: { $in: eventIds }, status : 1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, expo:expo }]})
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
        const expo = await expoModel.find({
          eventId : req.body.eventId,
          status : [0,1]
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, expo:expo }]})
      }
    } catch (error) {
      return catchError('Event.expoByEventSa', error, req, res)
    }
  }

  async sessionByEventSa (req, res, next) {
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
        const session = await sessionModel.find( { eventId: { $in: eventIds } , session_type : "Session", status : 1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, session:session }]})
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
        const session = await sessionModel.find({
          eventId : req.body.eventId,
          session_type : 'Session',
          status : [0,1],
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, session:session }]})
      }
    } catch (error) {
      return catchError('Event.sessionByEventSa', error, req, res)
    }
  }

  async stageByEventSa (req, res, next) {
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
        const stage = await stageModel.find( { eventId: { $in: eventIds } , session_type : "Stage", status : 1 } );
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:eventIds.length, stage:stage }]})
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
        const stage = await stageModel.find({
          eventId : req.body.eventId,
          session_type : 'Stage',
          status : [0,1],
         });
        return response(req, res, status.OK, jsonStatus.OK, 'success2', { status: 1, data: [{ event:eventIds.length, stage:stage }]})
      }
    } catch (error) {
      return catchError('Event.stageByEventSa', error, req, res)
    }
  }

  async eventsByOrgSa (req, res, next) {
    try {
      if (req.body.organizationId !=="null" && req.body.eventId == "null") {
        const event = await eventModel.find({
          organizationId: req.body.organizationId,
          status : [0,1]
        }).sort({_id:-1});
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{ event:event }]})
      }
    } catch (error) {
      return catchError('Event.eventsByOrgSa', error, req, res)
    }
  }
  
  async deleteEventByOrg (req, res, next) {
    try {
      const eventId = req.body.eventId;
      const event = await eventModel.findById(eventId);
      if (!event) return next(new Error('Event does not exist'));
      if ( event.isActive == true) return response(req, res, status.OK, jsonStatus.BadRequest, 'evt_cnt');
      await eventModel.findByIdAndUpdate(req.body.eventId, { status: -1 , deleted_by_org : req.body.organizationId });   //_id : Org
      return response(req, res, status.OK, jsonStatus.OK, 'evt_dlt', { status: 1 })
    } catch (error) {  
      return catchError('Event.deleteEventByOrg', error, req, res)
    }
  }

  async deleteEvent (req, res, next) {
    try {
      const event = await eventModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Event (${event.name}) has been deleted by ${event.organizationId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'evt_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteEvent', error, req, res)
    }
  }

  async deleteEventBySuperAdmin (req, res, next) {
    try {
      const eventId = req.body.eventId;
      const event = await eventModel.findById(eventId);
      if (!event) return next(new Error('Event does not exist'));
      // const starts_at = new Date();
      // const ends_at = new Date(event.ends_at);
      // if (starts_at < ends_at) return response(req, res, status.OK, jsonStatus.BadRequest, 'evt_cnt');
      // let isActive;
      if ( event.isActive == true) return response(req, res, status.OK, jsonStatus.BadRequest, 'cnt_dlt');
      let role;
      let superAdmin;
      // const user = await userModel.findOne({ role });
      // if (user.role === superAdmin) {
      await eventModel.findByIdAndDelete(req.body.eventId, { status: -1 , deleted_by_org : req.body.superAdminId });
      return response(req, res, status.OK, jsonStatus.OK, 'evt_dlt', { status: 1 })
    // }
    } catch (error) {  
      return catchError('Event.deleteEventBySuperAdmin', error, req, res)
    }
  }

  async eventSdnDataHdBySa (req, res, next) {
    try {
      const eventId = req.body.eventId;
      const event = await eventModel.findById(eventId);
      if (!event) return next(new Error('Event does not exist'));
      // const starts_at = new Date();
      // const ends_at = new Date(event.ends_at);
      // if (starts_at < ends_at) return response(req, res, status.OK, jsonStatus.BadRequest, 'evt_cnt');
      // let isActive;
      if ( event.isActive == true) return response(req, res, status.OK, jsonStatus.BadRequest, 'cnt_dlt');
      let role;
      let superAdmin;
      // const user = await userModel.findOne({ role });
      // if (user.role === superAdmin) {
      
      const organization = await userModel.findById({
        _id : req.body._id
      })
      const descr = event.name + " has been deleted by " + organization.name;     
      const notification = await new notificationModel({
        // organizationId : req.body.organizationId,
        // name : req.body.name,
        description: descr,
        status : -1
      })
      socket.emit("notifications", notification);

      await eventModel.findByIdAndUpdate(req.body.eventId, { status: -1 , deleted_by : req.body._id });   //_id : SA
      await speakerModel.deleteMany({eventId:eventId});
      await sponsorModel.deleteMany({eventId:eventId});
      await expoModel.deleteMany({eventId:eventId});

      // await speakerModel.deleteMany(req.body.eventId, { status: -1});  
      // await sponsorModel.deleteMany(req.body.eventId, { status: -1});
      // await expoModel.deleteMany(req.body.eventId, { status: -1});   
      await notification.save();       
      return response(req, res, status.OK, jsonStatus.OK, 'evt_dlt', { status: 1 })
    } catch (error) {  
      return catchError('Event.eventSdnDataHdBySa', error, req, res)
    }
  }

  async addSpeaker(req, res) {
    try {
      const speaker = new speakerModel({
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        username_email : req.body.username_email,
        designation : req.body.designation,
        isFeatured : req.body.isFeatured,
        speaker_list : req.body.speaker_list,
        code : req.body.code,
        banner_cat : req.body.banner_cat,
        role : 'speaker'
      })
      const user = new userModel({
        eventId : req.body.eventId,
        email : req.body.username_email,
        name : req.body.name,
        designation : req.body.designation,
        role : 'speaker'
      })
      // const email = req.body.email;
      // const existingUser = await speakerModel.findOne({ email });
      //     if (existingUser) {
      //       if (existingUser.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }

      // const email = req.body.email;
      // if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      // const existingSpeakerEmail = await speakerModel.findOne({ email: email });
      //     if (existingSpeakerEmail) {
      //       if (existingSpeakerEmail.email[0] === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'spe_alr_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }



      // const email = req.body.email;
      // const eventId = req.body.eventId;
      // const existingEvent = await speakerModel.find({ eventId, email });
      // if (existingEvent.length) {
      //       if (existingEvent.eventId === req.body.eventId && existingEvent.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'already_email_exist_with_event')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_already_existwith_eventid')
      //     }
      //   }




      // if(req.files){  //for arr
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   speaker.avatar = path.split(",")
      // }

      if (req.files) {   //for str
        let path = ''
        req.files.forEach(function(files, index, arr) {
            path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        speaker.avatar = path
      }

      if (req.files) {   //for str
        let path = ''
        req.files.forEach(function(files, index, arr) {
            path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        user.logo = path
      }

      // const username_email = req.body.username_email;
      // if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      // const existingEmail = await userModel.findOne({ email: username_email });
      // // console.log(existingEmail, "existingemail");
      //     if (existingEmail) {
      //       if (existingEmail.email[0] === req.body.username_email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }



        const username_email = req.body.username_email;
        const email = req.body.username_email;
        if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
        const eventId = req.body.eventId;
        const existingEventEmail = await userModel.find({ eventId, email });
        if (existingEventEmail.length) {
              if (existingEventEmail.eventId === req.body.eventId && existingEventEmail.email === req.body.username_email) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event_id')
            } else {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event')
            }
          }



      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The generated credential is ${emailPassword}`);
      var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
      const event = await eventModel.findById(req.body.eventId);
      var eventDetails;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      sendEmailCred(emailPassword, username_email, 'VOE:Speaker Credential', true, eventDetails)
      user.password = hashedPassword; // Updating the password
      speaker.password = hashedPassword; // Updating the password
      await user.save()
      await speaker.save();
      return response(req, res, status.Create, jsonStatus.Create, 'speaker_create', { status: 1, data: speaker })
    } catch (error) {  
    return catchError('Event.addSpeaker', error, req, res)
    }
  }

  async allSpeaker (req, res) {
    try {
      const speakers = await speakerModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakers })
    } catch (error) {
      return catchError('Event.allSpeaker', error, req, res)
    }
  }

  async editSpeaker(req, res) {
    try { 
      const speaker = await speakerModel.findByIdAndUpdate( req.body.speaker_id, {
        eventId : req.body.eventId,
        name: req.body.name,
        email : req.body.email,
        description: req.body.description,
        website: req.body.website,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        phone_number: req.body.phone_number,
        address: req.body.address,
        username_email : req.body.username_email,
        designation : req.body.designation,
        isFeatured : req.body.isFeatured,
        speaker_list : req.body.speaker_list,
        banner_cat : req.body.banner_cat,
        status: 1,
      }, {new: true });
      // const email = req.body.email;
      // const existingUser = await speakerModel.findOne({ email });
      //     if (existingUser) {
      //       if (existingUser.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   speaker.avatar = path.split(",")
      // }

        // // console.log('avatar', req.body.avatar);   //spe arr
        // let speakerAvatars = [];
        // if(req.files){
        //   // console.log('file', req.files)
        //   let path = ''
        //   req.files.forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   speakerAvatars = path.split(",")
        // }

        // if(Array.isArray(req.body.avatar)){
        //   if(speakerAvatars.length > 0 && speakerAvatars[0] != ''){
        //     speaker.avatar = speakerAvatars.concat(req.body.avatar);
        //   } else {
        //     speaker.avatar = req.body.avatar;
        //   }
        // } else {
        //   if(speakerAvatars.length > 0 && speakerAvatars[0] != ''){
        //     speaker.avatar = speakerAvatars;
        //   } else {
        //     speaker.avatar = null;
        //   }
        // }
        // console.log('speaker.avatar', speaker.avatar);
        if (typeof req.files !== 'undefined' && req.files.length > 0) {       //for str         
          speaker.avatar = req.files[0].path
        }
        if ( typeof req.body.avatar !== 'undefined' && req.body.avatar )
        {
            speaker.avatar = req.body.avatar; 
        }
      speaker.save()
      return response(req, res, status.OK, jsonStatus.OK, 'speaker_updated', { status: 1, data: speaker })
    } catch (error) {  
    return catchError('Event.editSpeaker', error, req, res)
    }
  }

  async speakerDetail (req, res , next)  {
    try {
      const speakerId = req.body.id;
      const speaker = await speakerModel.findById(speakerId);
      if (!speaker) return next(new Error('Speaker does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speaker })
    } catch (error) {  
      return catchError('Event.speakerDetail', error, req, res)
    }
  }

  async speakerByEvent (req, res, next) {
    try {
      const speaker = await speakerModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({_id:-1});
      if (!speaker) return next(new Error('Speaker does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speaker })


      // const speaker = await speakerModel.aggregate([
      //   {
      //     $lookup: {
      //       from: "Speaker",
      //       let: {
      //         speakerId: "$speakerId",
      //         eventId: "$event"
      //       },
      //       pipeline: [
      //         { $match: { $expr: { $eq: ["$$speakerId", "$_id"] } } },
      //         {
      //           $replaceRoot: {
      //             newRoot: {
      //               $arrayElemAt: [
      //                 {
      //                   $filter: {
      //                     input: "$event",
      //                     cond: { $eq: ["$$this._id", "$$eventId"] }
      //                   }
      //                 },
      //                 0
      //               ]
      //             }
      //           }
      //         }
      //       ],
      //       as: "eventData"
      //     }
      //   }
      // ])
      //       return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speaker })

    } catch (error) {
      return catchError('Event.speakerByEvent', error, req, res)
    }
  }

  async totalSpeakers (req, res) {
    try {
      const speakers = await speakerModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakers })
    } catch (error) {
      return catchError('Event.totalSpeakers', error, req, res)
    }
  }

  async addSpeakerToFeature(req, res) {
    try { 
      const speaker = await speakerModel.findByIdAndUpdate( req.body.speakerId, {
        eventId: req.body.eventId,
        isFeatured: true,
      }, {new: true });
      await speaker.save()
      return response(req, res, status.OK, jsonStatus.OK, 'spe_add_feat', { status: 1, data: speaker })
    } catch (error) {  
    return catchError('Event.addSpeakerToFeature', error, req, res)
    }
  }

  async rmvSpeakerToFeature(req, res) {
    try { 
      const speaker = await speakerModel.findByIdAndUpdate( req.body.speakerId, {
        eventId: req.body.eventId,
        isFeatured: false,
      }, {new: true });
      await speaker.save()
      return response(req, res, status.OK, jsonStatus.OK, 'spe_rm_feat', { status: 1, data: speaker })
    } catch (error) {  
    return catchError('Event.rmvSpeakerToFeature', error, req, res)
    }
  }

  async rmvAllTSpeakerToFeature(req, res) {
    try { 
      let eventId = req.body.eventId;
      const speaker = await speakerModel.find({eventId, isFeatured: true}).updateMany({isFeatured: false})
      // await speaker.save()
      return response(req, res, status.OK, jsonStatus.OK, 'all_rm_spe_feat', { status: 1, })
    } catch (error) {  
    return catchError('Event.rmvAllTSpeakerToFeature', error, req, res)
    }
  }

  async addSponsor(req, res) {
    try {
      const sponsor = new sponsorModel({
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        product_catalouge : req.body.product_catalouge,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        username_email : req.body.username_email,
        isFeatured : req.body.isFeatured,
        sponsor_list : req.body.sponsor_list,
        code : req.body.code,
        banner_cat : req.body.banner_cat,
        role : 'sponsor'
      })
      const user = new userModel({
        eventId : req.body.eventId,
        email : req.body.username_email,
        name : req.body.name,
        role : 'sponsor'
      })
      // const email = req.body.email;
      // const existingUser = await sponsorModel.findOne({ email: email });
      // console.log(existingUser, "existinguser")
      //     if (existingUser) {
      //       if (existingUser.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }
      // if(req.files){  //for arr
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   sponsor.logo = path.split(",")
      // }

      // if (req.files) {   //for str
      //   let path = ''
      //   req.files.forEach(function(files, index, arr) {
      //       path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   sponsor.logo = path
      // }

        if (typeof req.files.logo !== 'undefined' && req.files.logo.length > 0) {            //banner replace or pass str & for null pass
        sponsor.logo = req.files.logo[0].path
        }
        if ( typeof req.body.logo !== 'undefined' && req.body.logo )
        {
          sponsor.logo = req.body.logo; 
        }

        if (typeof req.files.banner !== 'undefined' && req.files.banner.length > 0) {            //banner replace or pass str & for null pass n add in editSpo 
        sponsor.banner = req.files.banner[0].path
        }
        if ( typeof req.body.banner !== 'undefined' && req.body.banner )
        {
          sponsor.banner = req.body.banner; 
        }

      // const username_email = req.body.username_email;
      // if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      // const existingEmail = await userModel.findOne({ email: username_email });
      // // console.log(existingEmail, "existingemail");
      //     if (existingEmail) {
      //       if (existingEmail.email[0] === req.body.username_email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }


    
      const username_email = req.body.username_email;
      const email = req.body.username_email;
      if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      const eventId = req.body.eventId;
      const existingEventEmail = await userModel.find({ eventId, email });
      if (existingEventEmail.length) {
            if (existingEventEmail.eventId === req.body.eventId && existingEventEmail.email === req.body.username_email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event_id')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event')
          }
        }


      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The generated credential is ${emailPassword}`);
      var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
      const event = await eventModel.findById( req.body.eventId);
      // console.log(event);
      var eventDetails;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      sendEmailCred(emailPassword, username_email, 'VOE:Sponsor Credential', true, eventDetails)
      user.password = hashedPassword;
      sponsor.password = hashedPassword;
      await user.save()
      await sponsor.save();
      return response(req, res, status.Create, jsonStatus.Create, 'partner_add', { status: 1, data: sponsor })
    } catch (error) {  
    return catchError('Event.addSponsor', error, req, res)
    }
  }

  async editSponsor(req, res) {
    try { 
      const sponsor = await sponsorModel.findByIdAndUpdate( req.body.sponsor_id, {
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        product_catalouge : req.body.product_catalouge,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        username_email : req.body.username_email,
        isFeatured : req.body.isFeatured,
        sponsor_list : req.body.sponsor_list,
        code : req.body.code,
        banner_cat : req.body.banner_cat,
        status: 1,
      }, {new: true });
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   sponsor.logo = path.split(",")
      // }

        // console.log('logo', req.body.logo);
        // let sponsorLogos = [];
        // if(req.files){
        //   // console.log('file', req.files)
        //   let path = ''
        //   req.files.forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   sponsorLogos = path.split(",")
        // }

        // if(Array.isArray(req.body.logo)){
        //   if(sponsorLogos.length > 0 && sponsorLogos[0] != ''){
        //     sponsor.logo = sponsorLogos.concat(req.body.logo);
        //   } else {
        //     sponsor.logo = req.body.logo;
        //   }
        // } else {
        //   if(sponsorLogos.length > 0 && sponsorLogos[0] != ''){
        //     sponsor.logo = sponsorLogos;
        //   } else {
        //     sponsor.logo = null;
        //   }
        // }
        // console.log('sponsor.logo', sponsor.logo);
        // if (typeof req.files !== 'undefined' && req.files.length > 0) {       //for str         
        //   sponsor.logo = req.files[0].path
        // }
        // if ( typeof req.body.logo !== 'undefined' && req.body.logo )
        // {
        //     sponsor.logo = req.body.logo; 
        // }

        if (typeof req.files.banner !== 'undefined' && req.files.banner.length > 0) {            //banner replace or pass str n banner null we can add here
          sponsor.banner = req.files.banner[0].path
        }
        if ( typeof req.body.banner !== 'undefined' && req.body.banner )
        {
          sponsor.banner = req.body.banner; 
        }

        if (typeof req.files.logo !== 'undefined' && req.files.logo.length > 0) {            //logo replace or pass str n banner null we can add here
          sponsor.logo = req.files.logo[0].path
        }
        if ( typeof req.body.logo !== 'undefined' && req.body.logo )
        {
          sponsor.logo = req.body.logo; 
        }
      sponsor.save()
      return response(req, res, status.OK, jsonStatus.OK, 'partner_updated', { status: 1, data: sponsor })
    } catch (error) {  
    return catchError('Event.editSponsor', error, req, res)
    }
  }

  async addSponsorToFeature(req, res) {
    try { 
      const sponsor = await sponsorModel.findByIdAndUpdate( req.body.sponsorId, {
        eventId: req.body.eventId,
        isFeatured: true,
      }, {new: true });
      await sponsor.save()
      return response(req, res, status.OK, jsonStatus.OK, 'spo_add_feat', { status: 1, data: sponsor })
    } catch (error) {  
    return catchError('Event.addSponsorToFeature', error, req, res)
    }
  }

  async rmvSponsorToFeature(req, res) {
    try { 
      const Sponsor = await sponsorModel.findByIdAndUpdate( req.body.sponsorId, {
        eventId: req.body.eventId,
        isFeatured: false,
      }, {new: true });
      await Sponsor.save()
      return response(req, res, status.OK, jsonStatus.OK, 'spo_rm_feat', { status: 1, data: Sponsor })
    } catch (error) {  
    return catchError('Event.rmvSponsorToFeature', error, req, res)
    }
  }

  async rmvAllTSponsorToFeature(req, res) {
    try { 
      let eventId = req.body.eventId;
      const Sponsor = await sponsorModel.find({eventId, isFeatured: true}).updateMany({isFeatured: false})
      // await Sponsor.save()
      return response(req, res, status.OK, jsonStatus.OK, 'all_rm_spo_feat', { status: 1, })
    } catch (error) {  
    return catchError('Event.rmvAllTSponsorToFeature', error, req, res)
    }
  }

  async sponsorBulkUpload(req, res) {
    try {
      const sponsor = new sponsorModel({
      })
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        sponsor.logo = path.split(",")
      }
      sponsor.save()
      return response(req, res, status.Create, jsonStatus.Create, 'b_sponsor_upload', { status: 1 })
    } catch (error) {  
    return catchError('Event.sponsorBulkUpload', error, req, res)
    }
  }
  
  async allSponsor (req, res) {
    try {
      const sponsors = await sponsorModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsors })
    } catch (error) {
      return catchError('Event.allSponsor', error, req, res)
    }
  }

  async sponsorDetail (req, res , next)  {
    try {
      const sponsorId = req.body.id;
      const sponsor = await sponsorModel.findById(sponsorId);
      if (!sponsor) return next(new Error('Sponsor does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsor })
    } catch (error) {  
      return catchError('Event.sponsorDetail', error, req, res)
    }
  }

  async sponsorByEvent (req, res, next) {
    try {
      const sponsor = await sponsorModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({_id:-1});
      if (!sponsor) return next(new Error('Sponsor does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsor })
    } catch (error) {
      return catchError('Event.sponsorByEvent', error, req, res)
    }
  }

  async sponsorByOrg (req, res, next) {
    try {
      const sponsor = await sponsorModel.find( { status : [ 1 ] , organizationId : req.body.organizationId } ).sort({_id:-1});
      if (!sponsor) return next(new Error('Sponsor does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsor })
    } catch (error) {
      return catchError('Event.sponsorByOrg', error, req, res)
    }
  }

  async allDeletedSpeaker (req, res) {
    try {
      const speakers = await speakerModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakers })
    } catch (error) {
      return catchError('Event.allDeletedSpeaker', error, req, res)
    }
  }

  async deleteSpeaker (req, res, next) {
    try {
      const speaker = await speakerModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Speaker (${speaker.name}) has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'spe_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteSpeaker', error, req, res)
    }
  }

  async allDeletedSponsor (req, res) {
    try {
      const sponsors = await sponsorModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsors })
    } catch (error) {
      return catchError('Event.allDeletedSponsor', error, req, res)
    }
  }

  async deleteSponsor (req, res, next) {
    try {
      const sponsor = await sponsorModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Sponsor (${sponsor.name}) has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'spo_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteSponsor', error, req, res)
    }
  }

  async addStage(req, res) {
    try {
      const starts_at = new Date(req.body.starts_at);
      const ends_at = new Date(req.body.ends_at);
      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();
      const date = moment(new Date(req.body.starts_at)).format("DD/MM/yyyy");

      // let sessionSpeaker = []; //comment for eventBycode session
      // let sessionSpeakerData = [];
      // if(req.body.sessionSpeakers){
      //   let sessionSpeakers = await req.body.sessionSpeakers.split(",")
      //   for (let i = 0; i < sessionSpeakers.length; i++) {
      //     const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : sessionSpeakers[i] });
      //     sessionSpeaker.push(sessionSpeakerName);
      //     if(sessionSpeakerName.name){
      //         sessionSpeakerData.push({value :sessionSpeakers[i] , label :sessionSpeakerName.name})
      //       }
      //   }
      // }

      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }

      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      let sessionSponsor = [];
      let sessionSponsorData = [];
      if(req.body.sessionSponsors){
        let sessionSponsors = await req.body.sessionSponsors.split(",")
        for (let i = 0; i < sessionSponsors.length; i++) {
          const sessionSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : sessionSponsors[i] });
          sessionSponsor.push(sessionSponsorName) 
          if(sessionSponsorName.name){
              sessionSponsorData.push({value :sessionSponsors[i] , label :sessionSponsorName.name})
            }
        }
      }

      // let sessionSpeakers = req.body.sessionSpeakers.split(","); //comment for eventByCode schduleAgenda
      const stage = new stageModel({
        eventId : req.body.eventId,
        title: req.body.title,
        description: req.body.description,
        segment_backstage_link : req.body.segment_backstage_link,
        streamename : req.body.streamename,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        urlType : req.body.urlType,
        url : req.body.url,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        date: date, 
        session_type : "Stage"
      })
      const stageSession = new sessionModel({  //dupStageSession
        eventId : req.body.eventId,
        title: req.body.title,
        description: req.body.description,
        segment_backstage_link : req.body.segment_backstage_link,
        streamename : req.body.streamename,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        urlType : req.body.urlType,
        url : req.body.url,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        date: date, 
        session_type : "Stage"
      })
      const stageAgenda = new scheduleModel({  //dupStageAgenda
        eventId : req.body.eventId,
        title: req.body.title,
        description: req.body.description,
        segment_backstage_link : req.body.segment_backstage_link,
        streamename : req.body.streamename,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        urlType : req.body.urlType,
        url : req.body.url,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        date: date, 
        session_type : "Stage"
      })

      // const event = await eventModel.findOne({_id:req.body.eventId})
      // if ( event.starts_at != starts_at) {        
      //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'cnnt_acs_s', { status: 0 })
      // } else if ( event.ends_at != ends_at) {
      //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'cnnt_acs_e', { status: 0 })
      // }

      if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
      if (starts_at >= ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        stage.speakers = path.split(",")
      }
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        stageSession.speakers = path.split(",")
      }
      stage.save()
      stageSession.save()
      stageAgenda.save()
      return response(req, res, status.Create, jsonStatus.Create, 'stage_add', { status: 1, data: stage })
    } catch (error) {  
    return catchError('Event.addStage', error, req, res)
    }
  }

  async editStage(req, res) {
    try {
      const starts_at = new Date(req.body.starts_at);
      const ends_at = new Date(req.body.ends_at);
      const sessionTime = moment(new Date(req.body.starts_at)).format("HH:mm");
      const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();
      const newDate = moment(starts_at).format("DD/MM/yyyy") //for session arr data change format
      const url = req.body.url;

      // const stage = await stageModel.findByIdAndUpdate( req.body.stageId, { //cmnt for agenda dup
      //   eventId : req.body.eventId,
      //   title: req.body.title,
      //   description: req.body.description,
      //   segment_backstage_link : req.body.segment_backstage_link,
      //   streamename : req.body.streamename,
      //   starts_at: req.body.starts_at,
      //   ends_at : req.body.ends_at,
      //   scheduledSpeakers : scheduleSpeaker,
      //   date: date, 
      //   status : 1,
      // }, {new: true });

      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }

      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      const stage = await stageModel.findById( {_id : req.body._id} );
      const stageUpdate = await stageModel.findOneAndUpdate( {eventId:stage.eventId,
        title:stage.title, 
        description:stage.description, 
        // date:stage.date, 
        starts_at:stage.starts_at, 
        ends_at:stage.ends_at,
        starts_mm : stage.starts_mm,
        ends_mm : stage.ends_mm,
        urlType : stage.urlType,
        url : stage.url,
        // sessionTime:sessionTime,
        scheduledSpeakers: stage.scheduledSpeakers,
        schedSpeakers: stage.schedSpeakers,
      },
        {
        $set:{
          eventId : req.body.eventId,
          // session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          urlType : req.body.urlType,
          url : req.body.url,
          // sessionTime : sessionTime,
          // date: newDate, 
          // url : url,
          // sessionTime:sessionTime,
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

      const stageSessionUpdate = await sessionModel.findOneAndUpdate( {eventId:stage.eventId,
        title:stage.title, 
        description:stage.description, 
        // date:stage.date, 
        starts_at:stage.starts_at, 
        ends_at:stage.ends_at,
        starts_mm : stage.starts_mm,
        ends_mm : stage.ends_mm,
        urlType : stage.urlType,
        url : stage.url,
        // sessionTime:stage.sessionTime,
        // url:stage.url,
        scheduledSpeakers: stage.scheduledSpeakers,
        schedSpeakers: stage.schedSpeakers,
      },
        {
        $set:{
          eventId : req.body.eventId,
          // session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          urlType : req.body.urlType,
          url : req.body.url,
          // sessionTime : sessionTime,
          // date: newDate,
          // url: url, 
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

      const stageAgendaUpdate = await scheduleModel.findOneAndUpdate( {eventId:stage.eventId,
        title:stage.title, 
        description:stage.description, 
        // date:stage.date, 
        starts_at:stage.starts_at, 
        ends_at:stage.ends_at,
        starts_mm : stage.starts_mm,
        ends_mm : stage.ends_mm,
        urlType : stage.urlType,
        url : stage.url,
        // sessionTime:stage.sessionTime,
        scheduledSpeakers: stage.scheduledSpeakers,
        schedSpeakers: stage.schedSpeakers,
      },
        {
        $set:{
          eventId : req.body.eventId,
          // session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          urlType : req.body.urlType,
          url : req.body.url,
          // sessionTime : sessionTime,
          // date: newDate, 
          // url : url,
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});


      if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
      if (starts_at >= ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   stage.speakers = path.split(",")
      // }

        let stageSpeakers = [];
        if(req.files){
          // console.log('file', req.files)
          let path = ''
          req.files.forEach(function(files, index, arr){
            path = path + files.path + ','
          })
          path = path.substring(0, path.lastIndexOf(","))
          stageSpeakers = path.split(",")
        }

        if(Array.isArray(req.body.speakers)){
          if(stageSpeakers.length > 0 && stageSpeakers[0] != ''){
            stage.speakers = stageSpeakers.concat(req.body.speakers);
          } else {
            stage.speakers = req.body.speakers;
          }
        } else {
          if(stageSpeakers.length > 0 && stageSpeakers[0] != ''){
            stage.speakers = stageSpeakers;
          } else {
            stage.speakers = null;
          }
        }
        // console.log('stage.speakers', stage.speakers);
      // stage.save()
      return response(req, res, status.OK, jsonStatus.OK, 'stage_updated', { status: 1, data: {stageUpdate:stageUpdate,stageSessionUpdate:stageSessionUpdate,stageAgendaUpdate:stageAgendaUpdate} })
    } catch (error) {  
    return catchError('Event.editStage', error, req, res)
    }
  }
  
  async allStage (req, res) {
    try {
      const stages = await stageModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: stages })
    } catch (error) {
      return catchError('Event.allStage', error, req, res)
    }
  }

  async stageDetail (req, res , next)  {
    try {
      const stageId = req.body.id;
      const stage = await stageModel.findById(stageId);
      if (!stage) return next(new Error('Stage does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: stage })
    } catch (error) {  
      return catchError('Event.stageDetail', error, req, res)
    }
  }

  async stageByEvent (req, res, next) {
    try {
      const stage = await stageModel.find( { status : [ 1 ] , eventId : req.body.eventId, session_type : "Stage" } ).sort({_id:-1});
      if (!stage) return next(new Error('Stage does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: stage })
    } catch (error) {
      return catchError('Event.stageByEvent', error, req, res)
    }
  }

  async isStageWatch(req, res) {
    try {
        const user = await userModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
          isStageWatch: true,
        }, { new: true });
        await user.save()
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {
        return catchError('Event.isStageWatch', error, req, res)
    }
  }

  async stageWatchUser(req, res) {
    try {
        const user = await userModel.find({
          eventId : req.body.eventId,
          isStageWatch: true,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {
        return catchError('Event.stageWatchUser', error, req, res)
    }
  }

  async allDeletedStage (req, res) {
    try {
      const stage = await stageModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: stage })
    } catch (error) {
      return catchError('Event.allDeletedStage', error, req, res)
    }
  }

  async deleteStage (req, res, next) {
    try {
      // await stageModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      const stage = await stageModel.findById( {_id : req.body._id} );
      const sessionUpdate = await stageModel.findOneAndUpdate( {
        eventId : stage.eventId,
        title : stage.title,
        // description : stage.description,
        // sessionTime : stage.sessionTime,
        // date : stage.date,
        // starts_at : stage.starts_at,
        // ends_at : stage.ends_at,
        status : stage.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

      const sessionAgendaUpd = await scheduleModel.findOneAndUpdate( {
        eventId : stage.eventId,
        title : stage.title,
        // description : stage.description,
        // sessionTime : stage.sessionTime,
        // date : stage.date,
        // starts_at : stage.starts_at,
        // ends_at : stage.ends_at,
        status : stage.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

        const sessionStageUpd = await sessionModel.findOneAndUpdate( {
          eventId : stage.eventId,
          title : stage.title,
          // description : stage.description,
          // sessionTime : stage.sessionTime,
          // date : stage.date,
          // starts_at : stage.starts_at,
          // ends_at : stage.ends_at,
          status : stage.status,
        },
          {
          $set:{
            status : -1,
          }},{new: true});

      return response(req, res, status.OK, jsonStatus.OK, 'stg_dlt', { status: 1, })    
    } catch (error) {  
      return catchError('Event.deleteStage', error, req, res)
    }
  }
  
  async addPartner(req, res) {
    try {
      const partner = new partnerModel({
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        product_catalouge : req.body.product_catalouge,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        code : req.body.code,
        role : 'partner'
      })
      const user = new userModel({
        eventId : req.body.eventId,
        email : req.body.email,
        name : req.body.name,
        role : 'partner'
      })
      // const email = req.body.email;
      // const existingUser = await partnerModel.findOne({ email });
      //     if (existingUser) {
      //       if (existingUser.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use', { status: 0, success: false })
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error', { status: 0, success: false })
      //     }
      //   }
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        partner.logo = path.split(",")
      }
      // const email = req.body.email;
      // if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      // const existingEmail = await userModel.findOne({ email : email });
      //     if (existingEmail) {
      //       if (existingEmail.email[0] === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }


      const email = req.body.email;
      // const email = req.body.username_email;
      if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      const eventId = req.body.eventId;
      const existingEventEmail = await userModel.find({ eventId, email });
      if (existingEventEmail.length) {
            if (existingEventEmail.eventId === req.body.eventId && existingEventEmail.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event_id')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event')
          }
        }



        // const username_email = req.body.username_email;
      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The generated credential is ${emailPassword}`);
      var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
      const event = await eventModel.findById( req.body.eventId);
      console.log(event);
      var eventDetails;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      sendEmailCred(emailPassword, email, 'VOE:Partner Credential', true, eventDetails)
      user.password = hashedPassword;
      partner.password = hashedPassword;
      await user.save()
      await partner.save();
      return response(req, res, status.Create, jsonStatus.Create, 'partner_create', { status: 1, success: true, data: partner })
    } catch (error) {  
    return catchError('Event.addPartner', error, req, res)
    }
  }

  async editPartner(req, res) {
    try { 
      const partner = await partnerModel.findByIdAndUpdate( req.body.partner_id, {
        eventId : req.body.eventId,
        name: req.body.name,
        email : req.body.email,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        catalouge: req.body.catalouge,
        website: req.body.website,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        phone_number: req.body.phone_number,
        address: req.body.address,
        status: 1,
      }, {new: true });
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   partner.catalouge = path.split(",")
      // }

        // console.log('catalouge', req.body.catalouge);
        let partnerCatalouges = [];
        if(req.files){
          // console.log('file', req.files)
          let path = ''
          req.files.forEach(function(files, index, arr){
            path = path + files.path + ','
          })
          path = path.substring(0, path.lastIndexOf(","))
          partnerCatalouges = path.split(",")
        }

        if(Array.isArray(req.body.catalouge)){
          if(partnerCatalouges.length > 0 && partnerCatalouges[0] != ''){
            partner.catalouge = partnerCatalouges.concat(req.body.catalouge);
          } else {
            partner.catalouge = req.body.catalouge;
          }
        } else {
          if(partnerCatalouges.length > 0 && partnerCatalouges[0] != ''){
            partner.catalouge = partnerCatalouges;
          } else {
            partner.catalouge = null;
          }
        }
        // console.log('partner.catalouge', partner.catalouge);
      partner.save()
      return response(req, res, status.OK, jsonStatus.OK, 'partner_updated', { status: 1, data: partner })
    } catch (error) {  
    return catchError('Event.editPartner', error, req, res)
    }
  }

  async partnerDetail (req, res , next)  {
    try {
      const partnerId = req.body.id;
      const partner = await partnerModel.findById(partnerId);
      if (!partner) return next(new Error('Partner does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: partner })
    } catch (error) {  
      return catchError('Event.partnerDetail', error, req, res)
    }
  }
  
  async allPartner (req, res) {
    try {
      const partners = await partnerModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: partners })
    } catch (error) {
      return catchError('Show.allPartner', error, req, res)
    }
  }

  async partnerByEvent (req, res, next) {
    try {
      const partner = await partnerModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({_id:-1});
      if (!partner) return next(new Error('Partner does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: partner })
    } catch (error) {
      return catchError('Event.partnerByEvent', error, req, res)
    }
  }

  async totalPartners (req, res) {
    try {
      const partners = await partnerModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: partners })
    } catch (error) {
      return catchError('Event.totalPartners', error, req, res)
    }
  }

  async allDeletedPartner (req, res) {
    try {
      const partners = await partnerModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: partners })
    } catch (error) {
      return catchError('Event.allDeletedPartner', error, req, res)
    }
  }

  async deletePartner (req, res, next) {
    try {
      await partnerModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      return response(req, res, status.OK, jsonStatus.OK, 'prtn_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deletePartner', error, req, res)
    }
  }

  async addWelMsg(req, res) {
    try {
      const msg = new informationDeskModel({
        eventId : req.body.eventId,
        type : req.body.type,
        message: req.body.message,
      })
      msg.save()
      return response(req, res, status.Create, jsonStatus.Create, 'msg_spo_add', { status: 1, data: msg })
    } catch (error) {  
    return catchError('Event.addWelMsgForSponsor', error, req, res)
    }
  }

  async allWelMsg (req, res) {
    try {
      const msg = await informationDeskModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: msg })
    } catch (error) {
      return catchError('Event.allWelMsg', error, req, res)
    }
  }

  async msgsByType (req, res) {
    try {
      const msgs = await informationDeskModel.find( { type : req.body.type, status : [ 1 ]} ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: msgs })
    } catch (error) {
      return catchError('Event.msgsByType', error, req, res)
    }
  }

  async msgDetail (req, res , next)  {
    try {
      const msgId = req.body.id;
      const msg = await informationDeskModel.findById(msgId);
      if (!msg) return next(new Error('Message does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: msg })
    } catch (error) {  
      return catchError('Event.msgDetail', error, req, res)
    }
  }

  async deleteWelMsg (req, res, next) {
    try {
      await informationDeskModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      return response(req, res, status.OK, jsonStatus.OK, 'msg_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteWelMsg', error, req, res)
    }
  }

  async scheduleAgenda(req, res) {
    try {
      // let scheduledSpeakers = [];
      // if (req.body.scheduledSpeakers !== "") {
      //   scheduledSpeakers = await req.body.scheduledSpeakers.split(", ");
      // } 
      // const starts_at = new Date(req.body.starts_at);
      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();



    const starts_at = new Date(req.body.starts_at); 
    const sessionTime = moment(new Date(req.body.starts_at)).format("hh:mm A");
    const date =  starts_at.getDate() + "/"
                    + (starts_at.getMonth()+1)  + "/" 
                    + starts_at.getFullYear() + " @ "  
                    + starts_at.getHours() + ":"  
                    + starts_at.getMinutes() + ":" 
                    + starts_at.getSeconds();

      // const newDate = moment(starts_at).format("DD/MM/yyyy hh:mm:ss")
      const newDate = moment(starts_at).format("DD/MM/yyyy") //for session arr data change format

      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate()+'TO'+starts_at.getHours()+':'+starts_at.getMinutes()+':'+starts_at.getSeconds();
      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }

      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      let scheduleSponsor = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const scheduleSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
            if(scheduleSponsorName.name){
              scheduleSponsor.push({value :scheduledSponsors[i] , label :scheduleSponsorName.name})
            }
        }
      }
      
      let sessionSponsor = [];
      let sessionSponsorData = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const sessionSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
          sessionSponsor.push(sessionSponsorName);
          if(sessionSponsorName.name){
              sessionSponsorData.push({value :scheduledSponsors[i] , label :sessionSponsorName.name})
            }
        }
      }

      let scheduledSpeakers = req.body.scheduledSpeakers.split(","); //comment for session eventBycode dup(session)
      const agenda = new scheduleModel({
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title : req.body.title,
        description : req.body.description,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        url : req.body.url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        date: newDate, 
        doc : '',
      })
      const agendaSession = new sessionModel({ //dupAgendaSession
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title : req.body.title,
        description : req.body.description,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        url : req.body.url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        date: newDate, 
        doc : '',
      })
      const agendaStage = new stageModel({
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title: req.body.title,
        description: req.body.description,
        segment_backstage_link : req.body.segment_backstage_link,
        streamename : req.body.streamename,
        starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
        ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        url : req.body.url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        date: newDate, 
        doc : '',
      })
      // const starts_at = req.body.starts_at;
      // const ends_at = req.body.ends_at;
      // const existingAgenda = await scheduleModel.findOne({ starts_at });
      //     if (existingAgenda) {
      //       if (existingAgenda.starts_at === req.body.starts_at) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'agenda_already_sch')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }

        // const starts_at = new Date(req.body.starts_at);
        const ends_at = new Date(req.body.ends_at);
        const eventId = req.body.eventId;
        const existingAgenda = await scheduleModel.find({ eventId, starts_at, ends_at });
        if (existingAgenda.length) {
              if (existingAgenda.eventId === req.body.eventId && existingAgenda.starts_at === req.body.starts_at && existingAgenda.ends_at === req.body.ends_at) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'agenda_already_sch')
            } else {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'agenda_already_sch')
            }
          }
          if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
          if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
          if (starts_at >= ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        agenda.speakers = path.split(",")
      }
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        agendaSession.speakers = path.split(",")
      }
      agenda.save()
      agendaSession.save()
      agendaStage.save()
      return response(req, res, status.Create, jsonStatus.Create, 'agenda_sch', { status: 1, data: agenda })
    } catch (error) {  
    return catchError('Event.scheduleAgenda', error, req, res)
    }
  }

  async editScheduleAgenda(req, res) {
    try { 
      // let scheduledSpeakers = [];
      // if (req.body.scheduledSpeakers !== "") {
      //   scheduledSpeakers = await req.body.scheduledSpeakers.split(", ");
      // }
      const starts_at = new Date(req.body.starts_at);
      const sessionTime = moment(new Date(req.body.starts_at)).format("hh:mm A");
      // const date = starts_at.getFullYear()+'-'+(starts_at.getMonth()+1)+'-'+starts_at.getDate();
      const date =  starts_at.getDate() + "/"
      + (starts_at.getMonth()+1)  + "/" 
      + starts_at.getFullYear() + " @ "  
      + starts_at.getHours() + ":"  
      + starts_at.getMinutes() + ":" 
      + starts_at.getSeconds();

      const newDate = moment(starts_at).format("DD/MM/yyyy")

      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }

      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      let scheduleSponsor = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const scheduleSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
            if(scheduleSponsorName.name){
              scheduleSponsor.push({value :scheduledSponsors[i] , label :scheduleSponsorName.name})
            }
        }
      }
      
      let sessionSponsor = [];
      let sessionSponsorData = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const sessionSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
          sessionSponsor.push(sessionSponsorName);
          if(sessionSponsorName.name){
              sessionSponsorData.push({value :scheduledSponsors[i] , label :sessionSponsorName.name})
            }
        }
      }

      const agenda = await scheduleModel.findById( {_id : req.body._id} );
      const agendaUpdate = await scheduleModel.findOneAndUpdate( {eventId:agenda.eventId,
        title:agenda.title, 
        description:agenda.description, 
        date:agenda.date, 
        starts_at:agenda.starts_at, 
        ends_at:agenda.ends_at,
        starts_mm : agenda.starts_mm,
        ends_mm : agenda.ends_mm,
        url: agenda.url,
        participant : agenda.participant,
        scheduledSpeakers: agenda.scheduledSpeakers,
        schedSpeakers: agenda.schedSpeakers,
        scheduledSponsors: agenda.scheduledSponsors,
        schedSponsors: agenda.schedSponsors,
      },
        {
        $set:{
          eventId : req.body.eventId,
          session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          url : req.body.url,
          participant : req.body.participant,
          sessionTime : sessionTime,
          date: newDate,
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          scheduledSponsors : scheduleSponsor,
          schedSponsors : sessionSponsor,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

      const agendaSessionUpd = await sessionModel.findOneAndUpdate( {eventId:agenda.eventId,
        title:agenda.title, 
        description:agenda.description, 
        date:agenda.date, 
        starts_at:agenda.starts_at, 
        ends_at:agenda.ends_at,
        starts_mm : agenda.starts_mm,
        ends_mm : agenda.ends_mm,
        url: agenda.url,
        participant: agenda.participant,
        scheduledSpeakers: agenda.scheduledSpeakers,
        schedSpeakers: agenda.schedSpeakers,
        scheduledSponsors: agenda.scheduledSponsors,
        schedSponsors: agenda.schedSponsors,
      },
        {
        $set:{
          eventId : req.body.eventId,
          session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          url : req.body.url,
          participant : req.body.participant,
          sessionTime : sessionTime,
          date: newDate, 
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          scheduledSponsors : scheduleSponsor,
          schedSponsors : sessionSponsor,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

      const agendaStageUpd = await stageModel.findOneAndUpdate( {eventId:agenda.eventId,
        title:agenda.title, 
        description:agenda.description, 
        date:agenda.date, 
        starts_at:agenda.starts_at, 
        ends_at:agenda.ends_at,
        starts_mm : agenda.starts_mm,
        ends_mm : agenda.ends_mm,
        url:agenda.url,
        participant: agenda.participant,
        scheduledSpeakers: agenda.scheduledSpeakers,
        schedSpeakers: agenda.schedSpeakers,
        scheduledSponsors: agenda.scheduledSponsors,
        schedSponsors: agenda.schedSponsors,
      },
        {
        $set:{
          eventId : req.body.eventId,
          session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          url: req.body.url,
          participant : req.body.participant,
          sessionTime : sessionTime,
          date: newDate, 
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          scheduledSponsors : scheduleSponsor,
          schedSponsors : sessionSponsor,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

      // const starts_at = new Date(req.body.starts_at);
      const ends_at = new Date(req.body.ends_at);
      if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cannot');
      if (starts_at >= ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'time_cntt');
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   agenda.speakers = path.split(",")
      // }

      if (typeof req.files !== 'undefined' && req.files.length > 0) {                
        agendaUpdate.doc = req.files[0].path
      }
      if ( typeof req.body.doc !== 'undefined' && req.body.doc )
      {
          agendaUpdate.doc = req.body.doc; 
      }

      if (typeof req.files !== 'undefined' && req.files.length > 0) {                
        agendaSessionUpd.doc = req.files[0].path
      }
      if ( typeof req.body.doc !== 'undefined' && req.body.doc )
      {
          agendaSessionUpd.doc = req.body.doc; 
      }

      if (typeof req.files !== 'undefined' && req.files.length > 0) {                
        agendaStageUpd.doc = req.files[0].path
      }
      if ( typeof req.body.doc !== 'undefined' && req.body.doc )
      {
          agendaStageUpd.doc = req.body.doc; 
      }
        // console.log('speakers', req.body.speakers);
        // let agendaSpeakers = [];
        // if(req.files){
        //   // console.log('file', req.files)
        //   let path = ''
        //   req.files.forEach(function(files, index, arr){
        //     path = path + files.path + ','
        //   })
        //   path = path.substring(0, path.lastIndexOf(","))
        //   agendaSpeakers = path.split(",")
        // }

        // if(Array.isArray(req.body.speakers)){
        //   if(agendaSpeakers.length > 0 && agendaSpeakers[0] != ''){
        //     agenda.speakers = agendaSpeakers.concat(req.body.speakers);
        //   } else {
        //     agenda.speakers = req.body.speakers;
        //   }
        // } else {
        //   if(agendaSpeakers.length > 0 && agendaSpeakers[0] != ''){
        //     agenda.speakers = agendaSpeakers;
        //   } else {
        //     agenda.speakers = null;
        //   }
        // }
        // console.log('agenda.speakers', agenda.speakers);
      await agenda.save()
      await agendaUpdate.save()
      await agendaSessionUpd.save()
      await agendaStageUpd.save()
      return response(req, res, status.OK, jsonStatus.OK, 'agenda_updated', { status: 1, data: {agendaUpdate:agendaUpdate,agendaSessionUpd:agendaSessionUpd,agendaStageUpd:agendaStageUpd } })
    } catch (error) {  
    return catchError('Event.editScheduleAgenda', error, req, res)
    }
  }

  async allScheduledAgenda(req, res) {
    try {
      const agenda = await scheduleModel.find( { status : [ 1 ] } ).sort({date:1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.allScheduledAgenda', error, req, res)
    }
  }

  async allScheduledNetwork(req, res) {
    try {
      const agenda = await scheduleModel.find( { status : [ 1 ], session_type : "Network" } ).sort({id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.allScheduledNetwork', error, req, res)
    }
  }

  async scheduledAgendaDetail (req, res , next)  {
    try {
      const agendaId = req.body.id;
      const agenda = await scheduleModel.findById(agendaId);
      if (!agenda) return next(new Error('Agenda does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {  
      return catchError('Event.scheduledAgendaDetail', error, req, res)
    }
  }

  async scheduledAgendaByEvent (req, res, next) {
    try {
      const agenda = await scheduleModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({_id:-1});
      if (!agenda) return next(new Error('Agenda does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.scheduledAgendaByEvent', error, req, res)
    }
  }

  async scheduledNetworkByEvent(req, res, next) {
    try {
      const agenda = await scheduleModel.find( { status : [ 1 ], eventId : req.body.eventId, session_type : "Network" } ).sort({id:-1});
      if (!agenda) return next(new Error('Scheduled network does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.scheduledNetworkByEvent', error, req, res)
    }
  }

  async sessionStageScheduledByEvent(req, res, next) {
    try {
      const agenda = await scheduleModel.find( { status : [ 1 ], eventId : req.body.eventId, session_type : ["Session","Stage"] } ).sort({ "date":1  ,  "sessionTime": 1 });
      if (!agenda) return next(new Error('Scheduled does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.sessionStageScheduledByEvent', error, req, res)
    }
  }

  async allDeletedScheduledAgenda (req, res) {
    try {
      const agenda = await scheduleModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: agenda })
    } catch (error) {
      return catchError('Event.allDeletedScheduledAgenda', error, req, res)
    }
  }
  
  async deleteScheduledAgenda (req, res, next) {
    try {
      // await scheduleModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      const agenda = await scheduleModel.findById( {_id : req.body._id} );
      const agendaUpdate = await scheduleModel.findOneAndUpdate( {
        eventId : agenda.eventId,
        title : agenda.title,
        starts_at : agenda.starts_at,
        ends_at : agenda.ends_at,
        sessionTime : agenda.sessionTime,
        status : agenda.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

      const agendaSessionUpd = await sessionModel.findOneAndUpdate( {
        eventId : agenda.eventId,
        title : agenda.title,
        starts_at : agenda.starts_at,
        ends_at : agenda.ends_at,
        sessionTime : agenda.sessionTime,
        status : agenda.status,
        status : agenda.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

      const agendaStageUpd = await stageModel.findOneAndUpdate( {
        eventId : agenda.eventId,
        title : agenda.title,
        starts_at : agenda.starts_at,
        ends_at : agenda.ends_at,
        sessionTime : agenda.sessionTime,
        status : agenda.status,
        status : agenda.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

      return response(req, res, status.OK, jsonStatus.OK, 'agenda_dlt', { status: 1, })    
    } catch (error) {  
      return catchError('Event.deleteScheduledAgenda', error, req, res)
    }
  }

  async addExpoBooth(req, res) {
    try {
      const expo = new expoModel({
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        product_catalouge : req.body.product_catalouge,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        username_email : req.body.username_email,
        role : 'expo'
      })
      const user = new userModel({
        eventId : req.body.eventId,
        email : req.body.username_email,
        name : req.body.name,
        role : 'expo'
      })
      // const email = req.body.email;
      // const existingUser = await expoModel.findOne({ email });
      //     if (existingUser) {
      //       if (existingUser.email === req.body.email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   expo.logo = path.split(",")
      // }

      if (req.files) {   //for str
        let banner = "";
        req.files.forEach(function(files, index, arr) {
          banner = banner + files.path + ",";
        })
        banner = banner.substring(0, banner.lastIndexOf(","));    
        expo.banner = banner.split(",");
      }

      // if (req.files) {
      //   let banner = "";
      //   req.files["banner[]"].forEach(function (files, index, arr) {
      //     banner = banner + files.path + ",";
      //   });
      //   banner = banner.substring(0, banner.lastIndexOf(","));    
      //   event.banner = banner.split(",");     
      // }



      // const username_email = req.body.username_email;
      // if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      // const existingEmail = await userModel.findOne({ email: username_email });
      // // console.log(existingEmail, "existingemail");
      //     if (existingEmail) {
      //       if (existingEmail.email[0] === req.body.username_email) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //     }
      //   }



      const username_email = req.body.username_email;
      const email = req.body.username_email;
      if (!username_email || username_email === "" || username_email === null || username_email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      const eventId = req.body.eventId;
      const existingEventEmail = await userModel.find({ eventId, email });
      if (existingEventEmail.length) {
            if (existingEventEmail.eventId === req.body.eventId && existingEventEmail.email === req.body.username_email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event_id')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event')
          }
        }


      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The generated credential is ${emailPassword}`);
      var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
      const event = await eventModel.findById( req.body.eventId);
      // console.log(event);
      var eventDetails;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      sendEmailCred(emailPassword, username_email, 'VOE:Expo Credential', true, eventDetails)
      user.password = hashedPassword;
      expo.password = hashedPassword;
      await user.save()
      await expo.save();
      return response(req, res, status.Create, jsonStatus.Create, 'expo_create', { status: 1, data: expo })
    } catch (error) {  
    return catchError('Event.addExpoBooth', error, req, res)
    }
  }

  async allExpoBooth(req, res) {
    try {
      const expo = await expoModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: expo })
    } catch (error) {
      return catchError('Event.allExpoBooth', error, req, res)
    }
  }

  async editExpo(req, res) {
    try { 
      const expo = await expoModel.findByIdAndUpdate( req.body.expo_id, {
        eventId : req.body.eventId,
        name: req.body.name,
        description: req.body.description,
        youtube_embed_url : req.body.youtube_embed_url,
        product_catalouge : req.body.product_catalouge,
        website: req.body.website,
        facebook : req.body.facebook,
        instagram : req.body.instagram,
        twitter : req.body.twitter,
        linkedin : req.body.linkedin,
        address : req.body.address,
        phone_number : req.body.phone_number,
        email : req.body.email,
        username_email : req.body.username_email,
        status: 1,
      }, {new: true });
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   expo.logo = path.split(",")
      // }

          // console.log('banner', req.body.banner);  //for arr
          let expoBanners = [];
          if(req.files){
            // console.log('file', req.files)
            let path = ''
            req.files.forEach(function(files, index, arr){
              path = path + files.path + ','
            })
            path = path.substring(0, path.lastIndexOf(","))
            expoBanners = path.split(",")
          }
  
          if(Array.isArray(req.body.banner)){
            if(expoBanners.length > 0 && expoBanners[0] != ''){
              expo.banner = expoBanners.concat(req.body.banner);
            } else {
              expo.banner = req.body.banner;
            }
          } else {
            if(expoBanners.length > 0 && expoBanners[0] != ''){
              expo.banner = expoBanners;
            } else {
              expo.banner = null;
            }
          }
          // console.log('expo.banner', expo.banner);
          // if (typeof req.files !== 'undefined' && req.files.length > 0) {       //for str         
          //   expo.banner = req.files[0].path
          // }
          // if ( typeof req.body.banner !== 'undefined' && req.body.banner )
          // {
          //     expo.banner = req.body.banner; 
          // }
      expo.save()
      return response(req, res, status.OK, jsonStatus.OK, 'expo_updated', { status: 1, data: expo })
    } catch (error) {  
    return catchError('Event.editExpo', error, req, res)
    }
  }

  async expoByEvent (req, res, next) {
    try {
      const expo = await expoModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({_id:-1});
      if (!expo) return next(new Error('Expo does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: expo })
    } catch (error) {
      return catchError('Event.expoByEvent', error, req, res)
    }
  }

  async totalExpo (req, res) {
    try {
      const expo = await expoModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: expo })
    } catch (error) {
      return catchError('Event.totalExpo', error, req, res)
    }
  }

  async expoBoothDetail (req, res , next)  {
    try {
      const expoId = req.body.id;
      const expo = await expoModel.findById(expoId);
      if (!expo) return next(new Error('Expo booth does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: expo })
    } catch (error) {  
      return catchError('Event.expoBoothDetail', error, req, res)
    }
  }

  async allDeletedExpo (req, res) {
    try {
      const expo = await expoModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: expo })
    } catch (error) {
      return catchError('Event.allDeletedExpo', error, req, res)
    }
  }

  async deleteExpo (req, res, next) {
    try {
      await expoModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      return response(req, res, status.OK, jsonStatus.OK, 'expo_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteExpo', error, req, res)
    }
  }

  async uploadCsv(req, res) {
    try {
      const expo = new expoModel({
        eventId : req.body.eventId,
      })
        const email = req.body.email;
        const existingUser = await expoModel.findOne({ email });
            if (existingUser) {
              if (existingUser.email === req.body.email) {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
            } else {
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
            }
          }  
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        expo.csv = path.split(",")
      }
      expo.save()
      return response(req, res, status.Create, jsonStatus.Create, 'csv_add', { status: 1, data: expo })
    } catch (error) {  
    return catchError('Event.uploadCsv', error, req, res)
    }
  }

  async userRegForEve(req, res) {
    try {
      const { eventId, first_name, last_name, email, password, country_name } = req.body;
      if (!( eventId && email && password && first_name && last_name && country_name )) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'All input is required');
      }
      // const existingKey = await userRegEventModel.findOne({ email });
      // if (existingKey) {
      //   if (existingKey.email === req.body.email) {
      //     return response(req, res, status.OK, jsonStatus.BadRequest, 'Email_already_use')
      //   } else {
      //     return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
      //   }
      // }

      if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      const existingEventEmail = await userModel.find({ eventId, email });
      if (existingEventEmail.length) {
            if (existingEventEmail.eventId === req.body.eventId && existingEventEmail.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event_id')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'email_alr_ext_event')
          }
        }
      let encryptedPassword;
      encryptedPassword = await bcrypt.hash(password, 10);
      const user = new userModel({
        eventId : req.body.eventId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email : req.body.email,
        password: req.body.password,
        password: encryptedPassword,
        country_name : req.body.country_name,
        customField: req.body.customFields,
        role : "user",
        logo : ""
      })
      user.save()

      /*req.body.customFields.forEach(row => {
        const userForEvent = new userEventDetailModel({
          userId : user._id,
          eventId : req.body.eventId,
          customFormId : row.customFormObjId,
          customFieldValue: row.userInput
        })
        userForEvent.save()
      });*/
      
      const auth_key = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      user.auth_key = auth_key;
      return response(req, res, status.Create, jsonStatus.Create, 'user_reg_success', { status: 1, data: user })
    } catch (error) {  
      return catchError('Event.userRegForEve', error, req, res)
    }
  }

  async userLoginForEve(req, res) {
    try {
      const { eventId, email, password } = req.body;
      if (!(eventId && email && password)) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'all_req');
      }
      const user = await userRegEventModel.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        const auth_key = jwt.sign(
          { user_id: user._id, email },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );
        user.auth_key = auth_key;
        return response(req, res, status.OK, jsonStatus.OK, 'signin_success', { status: 1, data: user })
      }
      return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'invalid_cred');
    } catch (error) {  
      return catchError('Event.userLoginForEve', error, req, res)
    }
  }

  async editUserProfileForEve(req, res) {
    try { 
      const user = await userModel.findOneAndUpdate( {_id:req.body.userID, eventId : req.body.eventId,role : "user"} ,{
        first_name : req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        status : 1
      }, {new: true });
      return response(req, res, status.OK, jsonStatus.OK, 'profile_updated', { status: 1, data: user })
    } catch (error) {  
    return catchError('Event.editUserProfileForEve', error, req, res)
    }
  }

  async userChangePasswordForEve(req, res) {
    try { 
      const userId = req.body.userId;
      const eventId = req.body.eventId;
      const password = req.body.oldPassword;
      const existingUser = await userModel.findOne({ _id: userId, eventId });      
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
      if (await bcrypt.compare(oldPassword, existingUser.password) == false) return response(req, res, status.OK, jsonStatus.BadRequest, 'old_pwd_wrong');
      if (oldPassword === newPassword) return response(req, res, status.OK, jsonStatus.BadRequest, 'old_new_cant');
      if ((newPassword).status === false) return res.send((newPassword))
      existingUser.password = await hashPassword(newPassword)
      await existingUser.save();
      return response(req, res, status.OK, jsonStatus.OK, 'pwd_changed_eve', { status: 1, data: existingUser })
    } catch (error) {  
    return catchError('Event.userChangePasswordForEve', error, req, res)
    }
  }

  async totalRegUserForEvent (req, res) {
    try {
      const users = await userRegEventModel.aggregate([{$group: {
        _id : null,
        count : { $sum : 1}
      }}, {$project: {
        _id : 0
      }}]);
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: users })
    } catch (error) {
      return catchError('Event.totalRegUserForEvent', error, req, res)
    }
  }

  async attendeesForEvent (req, res) {
    try {
      const attendees = await userRegEventModel.find( { eventId : req.body.eventId, status : [ 1 ]} ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: attendees })
    } catch (error) {
      return catchError('Event.attendeesForEvent', error, req, res)
    }
  }

  async attendeesByCountry (req, res) {
    try {
      const attendees = await userRegEventModel.find( { eventId : req.body.eventId, country_name : req.body.country_name, status : [ 1 ]} ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: attendees })
    } catch (error) {
      return catchError('Event.attendeesForEvent', error, req, res)
    }
  }

  async addCustomField(req, res) {
    try {
      const customField = new customFormModel({
        eventId: req.body.eventId,
        name: req.body.name,
        lable : req.body.lable,
        input_type : req.body.input_type,
        placeholder : req.body.placeholder,
        radioGroup : req.body.radioGroup,
        radioName : req.body.radioName,
        selectionOption : req.body.selectionOption,
        sequence : req.body.sequence
      })
      // const eventId = req.body.eventId;
      // const sequence = req.body.sequence;
      // const existingEvent = await customFormModel.find({ eventId, sequence });
      // if (existingEvent.length) {
      //       if (existingEvent.eventId === req.body.eventId && existingEvent.sequence === req.body.sequence ) {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_seq')
      //     } else {
      //       return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alrd_seqc')
      //     }
      //   }
      customField.save()
      return response(req, res, status.Create, jsonStatus.Create, 'field_add', { status: 1, data: customField })
    } catch (error) {  
    return catchError('Event.addCustomField', error, req, res)
    }
  }

  async addCustomFieldNew(req, res) {
    try {
      // console.log(req.body[0]);
      req.body.forEach(element => {
        const customField = new customFormModel({
          eventId: element.eventId,
          name: element.name,
          lable : element.lable,
          input_type : element.input_type,
          placeholder : element.placeholder,
          radioGroup : element.radioGroup,
          radioName : element.radioName,
          selectionOption : element.selectionOption,
          sequence : element.sequence
        })
        customField.save()
      });
      return response(req, res, status.Create, jsonStatus.Create, 'field_add', { status: 1 })
    } catch (error) {  
    return catchError('Event.addCustomFieldNew', error, req, res)
    }
  }

  async editCustomField(req, res) {
    try { 
      const customField = await customFormModel.findByIdAndUpdate( req.body.customFieldId, {
        eventId : req.body.eventId,
        name: req.body.name,
        lable : req.body.lable,
        input_type : req.body.input_type,
        placeholder : req.body.placeholder,
        radioGroup : req.body.radioGroup,
        radioName : req.body.radioName,
        selectionOption : req.body.selectionOption,
        sequence : req.body.sequence,
        status : 1,
      }, {new: true });
      customField.save()
      return response(req, res, status.OK, jsonStatus.OK, 'cus_field_updated', { status: 1, data: customField })
    } catch (error) {  
    return catchError('Event.editCustomField', error, req, res)
    }
  }

  async allCustomField (req, res) {
    try {
      const customField = await customFormModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: customField })
    } catch (error) {
      return catchError('Event.allCustomField', error, req, res)
    }
  }

  async customfieldByEvent (req, res, next) {
    try {
      const customField = await customFormModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).sort({sequence:1});
      if (!customField) return next(new Error('CustomField does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: customField })
    } catch (error) {
      return catchError('Event.customfieldByEvent', error, req, res)
    }
  }

  async allDeletedCustomField (req, res) {
    try {
      const customField = await customFormModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: customField })
    } catch (error) {
      return catchError('Event.allDeletedCustomField', error, req, res)
    }
  }

  async deleteCustomField (req, res, next) {
    try {
      // await customFormModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      await customFormModel.findByIdAndDelete(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      return response(req, res, status.OK, jsonStatus.OK, 'cf_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteCustomField', error, req, res)
    }
  }

  async customFieldDetail (req, res , next)  {
    try {
      const customField = req.body.id;
      const field = await customFormModel.findById(customField);
      if (!field) return next(new Error('fieldId does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [field] })
    } catch (error) {  
      return catchError('Event.customFieldDetail', error, req, res)
    }
  }

  async customfieldUpdate(req, res, next) {
    try {
        let checkRespon = []
        let seqArray = req.body.sequenceArray
        let eventId = req.body.eventId
        const dbId = await customFormModel.find({
            eventId: eventId
        });
        // console.log("req.body:", dbId);

        if (dbId.length > 0) {
            // console.log("length:", dbId.length);

            for (let i = 0; i < dbId.length; i++) {
                // const element = array[index];
                for (let j = 0; j < seqArray.length; j++) {
                    if (dbId[i]._id == seqArray[j]._id) {
                        var custForm = await customFormModel.updateOne({
                                _id: dbId[i]._id
                            },

                            {
                                $set: {
                                    sequence: seqArray[j].sequence
                                }
                            }
                        );
                      checkRespon.push(seqArray[j]._id)
                    }
                }
            }
            if(checkRespon.length > 0){
              return response(req, res, status.OK, jsonStatus.OK, 'seq_update')
            }
            else{
              return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'custm_field_n')
            }
        } else {
            return next(new Error('EventId does not exist'));
        }
    } catch (error) {
        return catchError('Event.customfieldUpdate', error, req, res)
    }
  }

  async emailCredOrganization (req, res, next) {
    try {
      const { email, name } = req.body  
      if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      if (!name || name === "" || name === null || name === undefined) return res.status(401).send({ status: false, msg: 'Please provide Name.' })
      let user = await organizationModel.findOne({ email: email });  
      if (user === null || !user || user === undefined) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'no_user')
      }
      const emailPassword = generateRandomPassword().toString(); 
      const hashedOtp = await hashPassword(emailPassword); 
      console.log(`The generated credential is ${emailPassword}`);
      // sendEmail(emailPassword, email, true);
      var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
    //   sendEmail(random_number, email, true)
      sendEmailCred(emailPassword, email, 'VOE:Organization Credential', true)
      user.otpForgetPassword = hashedOtp; // Updating the password
      await user.save();
      return response(req, res, status.Create, jsonStatus.Create, 'cred_send', { status: 1, data: user })
    } catch (error) {  
      return catchError('Event.emailCredOrganization', error, req, res)
    } 
  }

  async postEventFeed(req, res) {
    // console.log(req.files[0].path.split(".")[req.files[0].path.split(".").length - 1],"req");
    let fileExt;
    if(req.files.length > 0){
      fileExt = req.files[0].path.split(".")[req.files[0].path.split(".").length - 1];
    }
    try {
      let eveFeedType = req.body.eveFeedType
      let description = req.body.description
      if (eveFeedType == "Discuss") {
        const feed = new eventFeedModel({
          eventId : req.body.eventId,
          userId: req.body.userId,
          eveFeedType : eveFeedType,
          description: req.body.description,
          docType : fileExt,
          isFlagged : req.body.isFlagged,
        })
        if (!description) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'des_mnd', { status: 0 })
        }
        if(req.files){
          let path = ''
          req.files.forEach(function(files, index, arr){
            path = path + files.path + ','
          })
          path = path.substring(0, path.lastIndexOf(","))
          feed.doc = path.split(",")
        }
        let DOCTYPE;
        if(fileExt === "jpeg" || fileExt === "png" || fileExt === "jpg" || fileExt === "gif" || fileExt === "tiff" || fileExt === "svg" || fileExt === "psd" || fileExt === "heif" || fileExt === "heic"){
          DOCTYPE = "image"
        } else if(fileExt === "mp4" || fileExt === "webm" || fileExt === "mkv" || fileExt === "m4v" || fileExt === "m4p" || fileExt === "avi" || fileExt === "wmv" || fileExt === "mpg" || fileExt === "mp2" || fileExt === "mpeg"){
          DOCTYPE = "video"
        } else {
          DOCTYPE = "pdf"
        }
        feed.save()
        // return response(req, res, status.Create, jsonStatus.Create, 'pst_crt_eve', { status: 1, data: feed, docType: DOCTYPE })
        return response(req, res, status.Create, jsonStatus.Create, 'pst_crt_eve', { status: 1, data: feed })
      } else {
        const feed = new eventFeedModel({
          eventId : req.body.eventId,
          userId: req.body.userId,
          eveFeedType : req.body.eveFeedType,
          feedIntroduceType : req.body.feedIntroduceType,
          description: req.body.description,
          isFlagged : req.body.isFlagged,
        })
        if (!description) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'des_mnd', { status: 0 })
        }
        feed.save()
        return response(req, res, status.Create, jsonStatus.Create, 'pst_crt_eve', { status: 1, data: feed })
      }
    } catch (error) {  
    return catchError('Event.postEventFeed', error, req, res)
    }
  }

  async editPostEventFeed(req, res) {
    try { 
      const feed = await eventFeedModel.findByIdAndUpdate( req.body.eventFeed_id, {
        eventId : req.body.eventId,
        userId: req.body.userId,
        eveFeedType : req.body.eveFeedType,
        feedIntroduceType : req.body.feedIntroduceType,
        description: req.body.description,
        docType : req.body.docType,
        isFlagged : req.body.isFlagged,
        status: 1,
      }, {new: true });
      // if(req.files){
      //   let path = ''
      //   req.files.forEach(function(files, index, arr){
      //     path = path + files.path + ','
      //   })
      //   path = path.substring(0, path.lastIndexOf(","))
      //   feed.doc = path.split(",")
      // }

          // console.log('doc', req.body.doc);
          let feedDocs = [];
          if(req.files){
            // console.log('file', req.files)
            let path = ''
            req.files.forEach(function(files, index, arr){
              path = path + files.path + ','
            })
            path = path.substring(0, path.lastIndexOf(","))
            feedDocs = path.split(",")
          }
  
          if(Array.isArray(req.body.doc)){
            if(feedDocs.length > 0 && feedDocs[0] != ''){
              feed.doc = feedDocs.concat(req.body.doc);
            } else {
              feed.doc = req.body.doc;
            }
          } else {
            if(feedDocs.length > 0 && feedDocs[0] != ''){
              feed.doc = feedDocs;
            } else {
              feed.doc = null;
            }
          }
          // console.log('feed.doc', feed.doc);
      feed.save()
      return response(req, res, status.OK, jsonStatus.OK, 'post_updated', { status: 1, data: feed })
    } catch (error) {  
    return catchError('Event.editPostEventFeed', error, req, res)
    }
  }

  async allFeedPost (req, res) {
    try {
      const feed = await eventFeedModel.aggregate([
        {
          $match : {
            // eventId : req.body.eventId
            eventId : mongoose.Types.ObjectId(req.body.eventId),  //changes for myfeedPost
          }
        },
        {
          $lookup: {
            from: "eveFeedCmnt",
            let: { eventFeedPost_Id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$eventFeedPostId", "$$eventFeedPost_Id"] } } },
              {
                $lookup: {
                  from: "user",
                  let: { userId: "$userId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    {
                      $project: {
                        _id : 1, 
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                        logo : 1,
                        phone_number : 1,
                        isSessionWatch : 1,
                        status : 1,
                      },
                    },
                  ],
                  as: "user",
                },
              },
              { $unwind: "$user" },
              {
                $project: {
                  _id : 1, 
                  comments:1,
                  userId:1,
                  status:1,
                  createdAt:1,
                  user : 1
                },
              },
            ],
            as: "cmt",
          },
        },
        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            cmt : 1,
            user : 1,
            createdAt : 1,
          }
        }
        
      ]).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.allFeedPost', error, req, res)
    }
  }

  async postDetail (req, res , next)  {
    try {
      const eventFeedId = req.body.id;
      const eventFeed = await eventFeedModel.findById(eventFeedId);
      if (!eventFeed) return next(new Error('Post does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: eventFeed })
    } catch (error) {  
      return catchError('Event.postDetail', error, req, res)
    }
  }

  async myFeedPost (req, res) {
    try {
      const feed = await eventFeedModel.aggregate([
        {
          $match : {
            eventId : mongoose.Types.ObjectId(req.body.eventId),
            userId : mongoose.Types.ObjectId(req.body.userId)
          }
        },
        {
          $lookup: {
            from: "eveFeedCmnt",
            let: { eventFeedPost_Id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$eventFeedPostId", "$$eventFeedPost_Id"] } } },
              {
                $lookup: {
                  from: "user",
                  let: { userId: "$userId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    {
                      $project: {
                        _id : 1, 
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                        logo : 1,
                        phone_number : 1,
                        isSessionWatch : 1,
                        status : 1,
                      },
                    },
                  ],
                  as: "user",
                },
              },
              { $unwind: "$user" },
              {
                $project: {
                  _id : 1, 
                  comments:1,
                  userId:1,
                  status:1,
                  createdAt:1,
                  user : 1
                },
              },
            ],
            as: "cmt",
          },
        },
        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        // {$unwind : "$cmt"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            cmt : 1,
            user : 1,
            createdAt : 1,
          }
        }
      ]).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.myFeedPost', error, req, res)
    }
  }

  async allPdfFeedPost (req, res) {
    try {
      const feed = await eventFeedModel.aggregate([
        {
          $match : {
            eventId : mongoose.Types.ObjectId(req.body.eventId),
            docType: {
              $in: ['pdf']
            }
          }
        },
        {
          $lookup: {
            from: "eveFeedCmnt",
            let: { eventFeedPost_Id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$eventFeedPostId", "$$eventFeedPost_Id"] } } },
              {
                $lookup: {
                  from: "user",
                  let: { userId: "$userId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    {
                      $project: {
                        _id : 1, 
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                        logo : 1,
                        phone_number : 1,
                        isSessionWatch : 1,
                        status : 1,
                      },
                    },
                  ],
                  as: "user",
                },
              },
              { $unwind: "$user" },
              {
                $project: {
                  _id : 1, 
                  comments:1,
                  userId:1,
                  status:1,
                  createdAt:1,
                  user : 1
                },
              },
            ],
            as: "cmt",
          },
        },
        // {$unwind : "$cmt"},
        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            cmt : 1,
            user : 1,
            createdAt : 1,
          }
        }
        
      ]).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.allPdfFeedPost', error, req, res)
    }
  }

  async allImageFeedPost (req, res) {
    try {
      const feed = await eventFeedModel.aggregate([
        {
          $match : {
            eventId : mongoose.Types.ObjectId(req.body.eventId),
            docType: {
              $in: ['jpeg', 'png','jpg','gif','tiff','psd','svg','heif','heic']
            }
          }
        },
        {
          $lookup: {
            from: "eveFeedCmnt",
            let: { eventFeedPost_Id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$eventFeedPostId", "$$eventFeedPost_Id"] } } },
              {
                $lookup: {
                  from: "user",
                  let: { userId: "$userId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    {
                      $project: {
                        _id : 1, 
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                        logo : 1,
                        phone_number : 1,
                        isSessionWatch : 1,
                        status : 1,
                      },
                    },
                  ],
                  as: "user",
                },
              },
              { $unwind: "$user" },
              {
                $project: {
                  _id : 1, 
                  comments:1,
                  userId:1,
                  status:1,
                  createdAt:1,
                  user : 1
                },
              },
            ],
            as: "cmt",
          },
        },
        // {$unwind : "$cmt"},
        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            cmt : 1,
            user : 1,
            createdAt : 1,
          }
        }
      ]).sort({_id: -1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.allImageFeedPost', error, req, res)
    }
  }

  async allVideoFeedPost (req, res) {
    try {
      const feed = await eventFeedModel.aggregate([
        {
          $match : {
            eventId : mongoose.Types.ObjectId(req.body.eventId),
            docType: {
              $in: ['mp4', 'avi','wmi','m4a','mkv','webm','m4v','m4p','wmv','mpg','mp2','mpeg']
            }
          }
        },
        {
          $lookup: {
            from: "eveFeedCmnt",
            let: { eventFeedPost_Id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$eventFeedPostId", "$$eventFeedPost_Id"] } } },
              {
                $lookup: {
                  from: "user",
                  let: { userId: "$userId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    {
                      $project: {
                        _id : 1, 
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                        logo : 1,
                        phone_number : 1,
                        isSessionWatch : 1,
                        status : 1,
                      },
                    },
                  ],
                  as: "user",
                },
              },
              { $unwind: "$user" },
              {
                $project: {
                  _id : 1, 
                  comments:1,
                  userId:1,
                  status:1,
                  createdAt:1,
                  user : 1
                },
              },
            ],
            as: "cmt",
          },
        },
        // {$unwind : "$cmt"},
        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            cmt : 1,
            user : 1,
            createdAt : 1,
          }
        }
        
      ]).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.allVideoFeedPost', error, req, res)
    }
  }

  async eventFeedComment(req, res) {
    try {
      const comments = req.body.comments
      if (!comments) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'cmnt_nl', { status: 0 })
      } else {
        const feed = new eveFeedCmntModel({
          eventFeedPostId: req.body.eventFeedPostId,
          eventId : req.body.eventId,
          userId: req.body.userId,
          comments: req.body.comments,
        })
          feed.save()
          return response(req, res, status.Create, jsonStatus.Create, 'cmnt_add', { status: 1, data: feed })
      }
    } catch (error) {  
    return catchError('Event.eventFeedComment', error, req, res)
    }
  }

  async editEventFeedComment(req, res) {
    try { 
      const feed = await eveFeedCmntModel.findByIdAndUpdate( req.body._id, {
        eventFeedPostId: req.body.eventFeedPostId,
        eventId : req.body.eventId,
        userId: req.body.userId,
        comments: req.body.comments,
        status: 1,
      }, {new: true });
      feed.save()
      return response(req, res, status.OK, jsonStatus.OK, 'cmnt_updated', { status: 1, data: feed })
    } catch (error) {  
    return catchError('Event.editEventFeedComment', error, req, res)
    }
  }

  async allEventFeedComment (req, res) {
    try {
      const post = await eveFeedCmntModel.find( { status : [ 1 ] } ).sort({_id:-1 });
      // const newPosts = post.map((item) => item.comments !== undefined && item).filter((item) => item);
      // return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: newPosts })
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: post })
    } catch (error) {
      return catchError('Event.allEventFeedComment', error, req, res)
    }
  }

  async commentOnFeedPost (req, res, next) {
    try {
      const post = await eveFeedCmntModel.find( { status : [ 1 ] , eventFeedPostId : req.body.eventFeedPostId } ).sort({id:-1})
      // const post = await eveFeedCmntModel.find( {},{ comments:1} ).sort({id:-1})
      if (!post) return next(new Error('Post does not exist with above eventFeedPostId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: post })
    } catch (error) {
      return catchError('Event.commentOnFeedPost', error, req, res)
    }
  }

  async commentOnPost (req, res ) {    
    try {  
      // let eventFeedPost = await eventFeedModel.find( { status : [ 1 ] , _id : req.body._id } ).sort({_id:-1});
      // if (eventFeedPost.length > 0) {
      //   let eveFeedComment =  await eveFeedCmntModel.find( { status : [ 1 ] , eventFeedPostId : eventFeedPost[0]._id.toString() } ).sort({_id:-1}).lean();  
      //   eventFeedPost.push({eveFeedComment: eveFeedComment});
      //   // for (let i = 0; i < eveFeedComment.length; i++) {
      //   //   const comment = await eveFeedCmntModel.find( {eventFeedPostId: eventFeedPost[0]._id.toString(), feedPostComments: { $eq: eveFeedComment[i]._id.toString() }} ).sort({id:-1}); 
      //   //   eveFeedComment[i].eveFeedPostComment = comment;
      //   // }
      //   return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {eventFeedPost:eventFeedPost}})
      // } else  {
      //   return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {eventFeedPost:eventFeedPost}})
      // }

      // console.log(req.body,"dfdgfg");
      const feed = await eveFeedCmntModel.aggregate([
        {
          $match : {
            eventFeedPostId : mongoose.Types.ObjectId(req.body.eventFeedPostId)
          }
        },

        {
          $lookup : {
            from : "user",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  _id : 1, 
                  first_name : 1,
                  last_name : 1,
                  email : 1,
                  logo : 1,
                  phone_number : 1,
                  isSessionWatch : 1,
                  status : 1,
                },
              },
            ],
            as: "user",
          }
        },
        {$unwind : "$user"},
        {
          $project  : {
            _id : 1 , 
            eventId : 1,
            userId : 1,
            eveFeedType : 1,
            description : 1,
            docType : 1,
            doc : 1,
            isFlagged : 1,
            status : 1,
            user : 1,
            comments:1
          }
        }
        
      ])
      // console.log(feed,"feed");
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1,  data:feed })
    } catch (error) {
      return catchError('Event.commentOnPost', error, req, res)
    }
  }

  async commentOnAllPost (req, res ) {    
    try {  
      let eventFeedPost = await eventFeedModel.find( { status : [ 1 ] , _id : req.body._id } ).sort({_id:-1});
      if (eventFeedPost.length > 0) {
        let eveFeedComment =  await eveFeedCmntModel.find( { status : [ 1 ] , eventFeedPostId : eventFeedPost[0]._id.toString() } ).sort({_id:-1}).lean();  
        eventFeedPost.push({eveFeedComment: eveFeedComment});
        let eveFeedCommentUser =  await userModel.find( { status : [ 1 ] , eventFeedPostId : eventFeedPost[0]._id.toString() } ).sort({_id:-1}).lean();  
        eventFeedPost.push({eveFeedCommentUser: eveFeedCommentUser});
        // for (let i = 0; i < eveFeedComment.length; i++) {
        //   const comment = await eveFeedCmntModel.find( {eventFeedPostId: eventFeedPost[0]._id.toString(), feedPostComments: { $eq: eveFeedComment[i]._id.toString() }} ).sort({id:-1}); 
        //   eveFeedComment[i].eveFeedPostComment = comment;
        // }
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {eventFeedPost:eventFeedPost}})
      } else  {
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {eventFeedPost:eventFeedPost}})
      }
    } catch (error) {
      return catchError('Event.commentOnAllPost', error, req, res)
    }
  }

  async allDeletedPost (req, res) {
    try {
      const feed = await eventFeedModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: feed })
    } catch (error) {
      return catchError('Event.allDeletedPost', error, req, res)
    }
  }

  async deleteFeedPost (req, res, next) {
    try {
      const eveFeed = await eventFeedModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Event Feed (${eveFeed._id}) has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'pt_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteFeedPost', error, req, res)
    }
  }

  async deleteFeedPostComment (req, res, next) {
    try {
      const eveFeedCmnt = await eveFeedCmntModel.findByIdAndUpdate(req.body.id, { status: -1 , cmnt_deleted_by_user : req.body.userId });
      logger.warn(`Event Feed post comment (${eveFeedCmnt._id}) has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'cmnt_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteFeedPostComment', error, req, res)
    }
  }

  async allDeletedfeedPostComment (req, res) {
    try {
      const feed = await eveFeedCmntModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: feed })
    } catch (error) {
      return catchError('Event.allDeletedfeedPostComment', error, req, res)
    }
  }

  async addSession(req, res) {
    try {
      const starts_at = moment(new Date(req.body.starts_at)).format("hh:mm A");
      const ends_at = moment(new Date(req.body.ends_at)).format("hh:mm A");
      const sessionTime = moment(new Date(req.body.starts_at)).format("hh:mm A");
      const startDateTime = moment(new Date(req.body.starts_at)).format("HH:mm");
      const endDateTime = moment(new Date(req.body.ends_at)).format("HH:mm");
      const date = req.body.date

      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 's_e_tm_cnt');
      if (startDateTime >= endDateTime) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 's_tm_e_cntt');

      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }
      
      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      //for spo
      let scheduleSponsor = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const scheduleSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
            if(scheduleSponsorName.name){
              scheduleSponsor.push({value :scheduledSponsors[i] , label :scheduleSponsorName.name})
            }
        }
      }
      
      let sessionSponsor = [];
      let sessionSponsorData = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const sessionSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
          sessionSponsor.push(sessionSponsorName);
          if(sessionSponsorName.name){
              sessionSponsorData.push({value :scheduledSponsors[i] , label :sessionSponsorName.name})
            }
        }
      }

      let scheduledSpeakers = req.body.scheduledSpeakers.split(","); //comment for session eventBycode dup(session)
      let url = req.body.url;
      if(req.body.urlType == "Zoom"){
        const avaiAcc = await zmKeyModel.findOne({ status: 1, meetType: 'Lounge'})
        const result = await axios.post("https://api.zoom.us/v2/users/" + avaiAcc.email + "/meetings", {
          topic: req.body.title,
          type: 3,
          duration: 30,
          //password: "12345678",
          agenda: req.body.description,
          participants_count: req.body.participant,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: true,
            mute_upon_entry: true
          }
        }, {
          headers: {
            'Authorization': 'Bearer ' + avaiAcc.token,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
          }
        });
        url = result.data.join_url;
      }
      
      const session = new sessionModel({
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title : req.body.title,
        description: req.body.description,
        date: date, 
        starts_at : starts_at, // req.body.startTime,
        ends_at: ends_at, //req.body.endTime,
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        startDateTime : startDateTime,
        endDateTime : endDateTime,
        url : url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        session_type : "Session",
        urlType: req.body.urlType
      })
      const sessionAgenda = new scheduleModel({
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title : req.body.title,
        description: req.body.description,
        date: date, 
        starts_at : starts_at, // req.body.startTime,
        ends_at: ends_at, //req.body.endTime,
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        startDateTime : startDateTime,
        endDateTime : endDateTime,
        url : url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        session_type : "Session",
        urlType: req.body.urlType
      })
      const sessionStage = new stageModel({
        eventId : req.body.eventId,
        session_type: req.body.session_type,
        title : req.body.title,
        description: req.body.description,
        date: date, 
        starts_at : starts_at, // req.body.startTime,
        ends_at: ends_at, //req.body.endTime,
        starts_mm : req.body.starts_at,
        ends_mm : req.body.ends_at,
        startDateTime : startDateTime,
        endDateTime : endDateTime,
        url : url,
        participant : req.body.participant,
        sessionTime : sessionTime,
        scheduledSpeakers : scheduleSpeaker,
        schedSpeakers : sessionSpeaker,
        scheduledSponsors : scheduleSponsor,
        schedSponsors : sessionSponsor,
        session_type : "Session",
        urlType: req.body.urlType
      })
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        session.doc = path.split(",")
      }
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        sessionAgenda.doc = path.split(",")
      }
      if(req.files){
        let path = ''
        req.files.forEach(function(files, index, arr){
          path = path + files.path + ','
        })
        path = path.substring(0, path.lastIndexOf(","))
        sessionStage.doc = path.split(",")
      }
      session.save()
      sessionAgenda.save()
      sessionStage.save()
      return response(req, res, status.Create, jsonStatus.Create, 'session_add', { status: 1, data: session })
    } catch (error) {  
    return catchError('Event.addSession', error, req, res)
    }
  }
  
  async editSession(req, res) {
    try { 
      const starts_at = req.body.starts_at
      const ends_at = req.body.ends_at
      const sessionTime = moment(new Date(req.body.starts_at)).format("hh:mm A");
      const startDateTime = moment(new Date(req.body.starts_at)).format("HH:mm");
      const endDateTime = moment(new Date(req.body.ends_at)).format("HH:mm");
      const date = req.body.date
      const url = req.body.url;

      let scheduleSpeaker = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const scheduleSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
            if(scheduleSpeakerName.name){
              scheduleSpeaker.push({value :scheduledSpeakers[i] , label :scheduleSpeakerName.name})
            }
        }
      }

      let sessionSpeaker = [];
      let sessionSpeakerData = [];
      if(req.body.scheduledSpeakers){
        let scheduledSpeakers = await req.body.scheduledSpeakers.split(",")
        for (let i = 0; i < scheduledSpeakers.length; i++) {
          const sessionSpeakerName = await speakerModel.findOne({ eventId : req.body.eventId , _id : scheduledSpeakers[i] });
          sessionSpeaker.push(sessionSpeakerName);
          if(sessionSpeakerName.name){
              sessionSpeakerData.push({value :scheduledSpeakers[i] , label :sessionSpeakerName.name})
            }
        }
      }

      //for spo
      let scheduleSponsor = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const scheduleSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
            if(scheduleSponsorName.name){
              scheduleSponsor.push({value :scheduledSponsors[i] , label :scheduleSponsorName.name})
            }
        }
      }
      
      let sessionSponsor = [];
      let sessionSponsorData = [];
      if(req.body.scheduledSponsors){
        let scheduledSponsors = await req.body.scheduledSponsors.split(",")
        for (let i = 0; i < scheduledSponsors.length; i++) {
          const sessionSponsorName = await sponsorModel.findOne({ eventId : req.body.eventId , _id : scheduledSponsors[i] });
          sessionSponsor.push(sessionSponsorName);
          if(sessionSponsorName.name){
              sessionSponsorData.push({value :scheduledSponsors[i] , label :sessionSponsorName.name})
            }
        }
      }

      const session = await sessionModel.findById( {_id : req.body._id} );
      const sessionUpdate = await sessionModel.findOneAndUpdate( {eventId:session.eventId,
        // session_type: req.body.session_type,
        title:session.title, 
        description:session.description, 
        date:session.date, 
        starts_at:session.starts_at, 
        ends_at:session.ends_at,
        starts_mm : session.starts_mm,
        ends_mm : session.ends_mm,
        startDateTime : session.startDateTime,
        endDateTime : session.endDateTime,
        url:session.url,
        participant:session.participant,
        sessionTime: session.sessionTime,
        scheduledSpeakers: session.scheduledSpeakers,
        schedSpeakers: session.schedSpeakers,
        scheduledSponsors: session.scheduledSponsors,
        schedSponsors: session.schedSponsors,
      },
        {
        $set:{
          eventId : req.body.eventId,
          // session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          date: date,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          startDateTime : moment(new Date(req.body.starts_at)).format("HH:mm"),
          endDateTime : moment(new Date(req.body.ends_at)).format("HH:mm"),
          url: url, 
          participant : req.body.participant,
          sessionTime : sessionTime,
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          scheduledSponsors : scheduleSponsor,
          schedSponsors : sessionSponsor,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
          urlType: req.body.urlType
        }},{new: true});

      const agendaUpdate = await scheduleModel.findOneAndUpdate( {eventId:session.eventId,
        // session_type: req.body.session_type,
        title:session.title, 
        description:session.description, 
        date:session.date, 
        starts_at:session.starts_at, 
        ends_at:session.ends_at,
        starts_mm : session.starts_mm,
        ends_mm : session.ends_mm,
        startDateTime : session.startDateTime,
        endDateTime : session.endDateTime,
        url:session.url,
        participant:session.participant,
        sessionTime: session.sessionTime,
        scheduledSpeakers: session.scheduledSpeakers,
        schedSpeakers: session.schedSpeakers,
        scheduledSponsors: session.scheduledSponsors,
        schedSponsors: session.schedSponsors,
      },
        {
        $set:{
          eventId : req.body.eventId,
          // session_type: req.body.session_type,
          title : req.body.title,
          description : req.body.description,
          date: date,
          starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
          ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
          starts_mm : req.body.starts_at,
          ends_mm : req.body.ends_at,
          startDateTime : moment(new Date(req.body.starts_at)).format("HH:mm"),
          endDateTime : moment(new Date(req.body.ends_at)).format("HH:mm"),
          url: url, 
          participant : req.body.participant,
          sessionTime : sessionTime,
          scheduledSpeakers : scheduleSpeaker,
          schedSpeakers : sessionSpeaker,
          scheduledSponsors : scheduleSponsor,
          schedSponsors : sessionSponsor,
          // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
          status : 1,
        }},{new: true});

        const agendaStageUpdate = await stageModel.findOneAndUpdate( {eventId:session.eventId,
          // session_type: req.body.session_type,
          title:session.title, 
          description:session.description, 
          date:session.date, 
          starts_at:session.starts_at, 
          ends_at:session.ends_at,
          starts_mm : session.starts_mm,
          ends_mm : session.ends_mm,
          startDateTime : session.startDateTime,
          endDateTime : session.endDateTime,
          url:session.url,
          participant:session.participant,
          sessionTime: session.sessionTime,
          scheduledSpeakers: session.scheduledSpeakers,
          schedSpeakers: session.schedSpeakers,
          scheduledSponsors: session.scheduledSponsors,
          schedSponsors: session.schedSponsors,
        },
          {
          $set:{
            eventId : req.body.eventId,
            // session_type: req.body.session_type,
            title : req.body.title,
            description : req.body.description,
            date: date,
            starts_at: moment(new Date(req.body.starts_at)).format("hh:mm A"),
            ends_at : moment(new Date(req.body.ends_at)).format("hh:mm A"),
            starts_mm : req.body.starts_at,
            ends_mm : req.body.ends_at,
            startDateTime : moment(new Date(req.body.starts_at)).format("HH:mm"),
            endDateTime : moment(new Date(req.body.ends_at)).format("HH:mm"),
            url: url, 
            participant : req.body.participant,
            sessionTime : sessionTime,
            scheduledSpeakers : scheduleSpeaker,
            schedSpeakers : sessionSpeaker,
            scheduledSponsors : scheduleSponsor,
            schedSponsors : sessionSponsor,
            // scheduledSpeakers : req.body.scheduledSpeakers.split(","),
            status : 1,
          }},{new: true});


      
      // if (!starts_at || starts_at === undefined) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'provide_time');
      if (starts_at === ends_at) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 's_e_tm_cnt');
      if (startDateTime >= endDateTime) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 's_tm_e_cntt');


        if (typeof req.files !== 'undefined' && req.files.length > 0) {                
          sessionUpdate.doc = req.files[0].path
        }
        if ( typeof req.body.doc !== 'undefined' && req.body.doc )
        {
            sessionUpdate.doc = req.body.doc; 
        }

        if (typeof req.files !== 'undefined' && req.files.length > 0) {                
          agendaUpdate.doc = req.files[0].path
        }
        if ( typeof req.body.doc !== 'undefined' && req.body.doc )
        {
            agendaUpdate.doc = req.body.doc; 
        }

        if (typeof req.files !== 'undefined' && req.files.length > 0) {                
          agendaStageUpdate.doc = req.files[0].path
        }
        if ( typeof req.body.doc !== 'undefined' && req.body.doc )
        {
            agendaStageUpdate.doc = req.body.doc; 
        }

      await session.save()
      await sessionUpdate.save()
      await agendaUpdate.save()
      await agendaStageUpdate.save()
      return response(req, res, status.OK, jsonStatus.OK, 'session_updated', { status: 1, data: {sessionUpdate:sessionUpdate, agendaUpdate:agendaUpdate, agendaStageUpdate:agendaStageUpdate} })
    } catch (error) {  
    return catchError('Event.editSession', error, req, res)
    }
  }

  async allSession (req, res) {
    try {
      const session = await sessionModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: session })
    } catch (error) {
      return catchError('Event.allSession', error, req, res)
    }
  }

  async sessionByEvent (req, res, next) {
    try {
      const session = await sessionModel.find( { status : [ 1 ] , eventId : req.body.eventId, session_type : "Session" } ).sort({date: 1 , sessionTime : 1})
      if (!session) return next(new Error('Session does not exist with above eventId'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: session })
    } catch (error) {
      return catchError('Event.sessionByEvent', error, req, res)
    }
  }

  async sessionDetail (req, res , next)  {
    try {
      const sessionId = req.body.id;
      const session = await sessionModel.findById(sessionId);
      if (!session) return next(new Error('Session does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: session })
    } catch (error) {  
      return catchError('Event.sessionDetail', error, req, res)
    }
  }

  async isSessionWatch(req, res) {
    try {
        const user = await userModel.findByIdAndUpdate({ _id: req.body._id , eventId : req.body.eventId}, {
          isSessionWatch: true,
        }, { new: true });
        await user.save()
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {
        return catchError('Event.isSessionWatch', error, req, res)
    }
  }

  async sessionWatchUser(req, res) {
    try {
        const user = await userModel.find({
          eventId : req.body.eventId,
          isSessionWatch: true,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {
        return catchError('Event.sessionWatchUser', error, req, res)
    }
  }

  async allDeletedSession (req, res) {
    try {
      const session = await sessionModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: session })
    } catch (error) {
      return catchError('Event.allDeletedSession', error, req, res)
    }
  }

  async deleteSession (req, res, next) {
    try {
      // await sessionModel.findByIdAndUpdate(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      const session = await sessionModel.findById( {_id : req.body._id} );
      const sessionUpdate = await sessionModel.findOneAndUpdate( {
        eventId : session.eventId,
        title : session.title,
        starts_at : session.starts_at,
        ends_at : session.ends_at,
        sessionTime : session.sessionTime,
        status : session.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

      const sessionAgendaUpd = await scheduleModel.findOneAndUpdate( {
        eventId : session.eventId,
        title : session.title,
        starts_at : session.starts_at,
        ends_at : session.ends_at,
        sessionTime : session.sessionTime,
        status : session.status,
        status : session.status,
      },
        {
        $set:{
          status : -1,
        }},{new: true});

        const agendaStageUpd = await stageModel.findOneAndUpdate( {
          eventId : session.eventId,
          title : session.title,
          starts_at : session.starts_at,
          ends_at : session.ends_at,
          sessionTime : session.sessionTime,
          status : session.status,
          status : session.status,
        },
          {
          $set:{
            status : -1,
          }},{new: true});

      return response(req, res, status.OK, jsonStatus.OK, 'ss_dlt', { status: 1, })    
    } catch (error) {  
      return catchError('Event.deleteSession', error, req, res)
    }
  }

  async addFeaSpeakerForSa(req, res) {
    try {
      const speakerName = new speakerCollModel({
        superAdminId : req.body.superAdminId,
        categoryName : req.body.categoryName,
        sequence : req.body.sequence,
      })
      const superAdminId = req.body.superAdminId;
      const categoryName = req.body.categoryName;
      const sequence = req.body.sequence;
      const existingSpeakerName = await speakerCollModel.find({ superAdminId, categoryName});
      if (existingSpeakerName.length) {
            if (existingSpeakerName.superAdminId === req.body.superAdminId && existingSpeakerName.categoryName === req.body.categoryName ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_nm_alr_spe')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_nm_fea_spe')
          }
        }
      const existingSequenceNumber = await speakerCollModel.find({ superAdminId, sequence });
      if (existingSequenceNumber.length) {
            if (existingSequenceNumber.superAdminId === req.body.superAdminId && existingSequenceNumber.sequence === req.body.sequence ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_seq_alr_spe')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_seqc_fea_spe')
          }
        }
      speakerName.save()
      return response(req, res, status.Create, jsonStatus.Create, 'fea_speaker_add', { status: 1, data: speakerName })
    } catch (error) {  
    return catchError('Event.addFeaSpeakerForSa', error, req, res)
    }
  }

  async editFeaSpeakerForSa(req, res) {
    try { 
      const _id = req.body._id;
      const superAdminId = req.body.superAdminId;
      const categoryName = req.body.categoryName;
      const sequence = req.body.sequence;
      const existingSponsorName = await speakerCollModel.findOne({ _id : { $ne : _id },  superAdminId, categoryName});
      if (existingSponsorName) {
            // if (existingSponsorName._id === req.body._id && existingSponsorName.superAdminId === req.body.superAdminId && existingSponsorName.categoryName === req.body.categoryName ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_nm_alr_spe')
          // } else {
          //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_nm_fea_spe')
          // }
        }
      const existingSequenceNumber = await speakerCollModel.findOne({ _id : {$ne : _id }, superAdminId, sequence });
      if (existingSequenceNumber) {
            // if (existingSequenceNumber._id === req.body._id && existingSequenceNumber.superAdminId === req.body.superAdminId && existingSequenceNumber.sequence === req.body.sequence ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_seq_alr_spe')
          // } else {
          //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_seqc_fea_spe')
          // }
        }
        const speakerName = await speakerCollModel.findByIdAndUpdate( req.body._id, {
          categoryName : req.body.categoryName,
          sequence : req.body.sequence,
          status : 1,
        }, {new: true });
        await speakerName.save()
        return response(req, res, status.OK, jsonStatus.OK, 'fea_spk_upd', { status: 1, data: speakerName })
      } catch (error) {  
    return catchError('Event.editFeaSpeakerForSa', error, req, res)
    }
  }

  async allFeaSpeakerForSa (req, res) {
    try {
      const speakerName = await speakerCollModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakerName })
    } catch (error) {
      return catchError('Event.allFeaSpeakerForSa', error, req, res)
    }
  }

  async feaSpeakerForSaDetail (req, res , next)  {
    try {
      const feaSpeakerId = req.body.feaSpeakerId;
      const speakerName = await speakerCollModel.findById(feaSpeakerId);
      if (!speakerName) return next(new Error('feature speaker does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakerName })
    } catch (error) {  
      return catchError('Event.feaSpeakerForSaDetail', error, req, res)
    }
  }

  async allDeletedFeaSpeakerForSa (req, res) {
    try {
      const speakerName = await speakerCollModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: speakerName })
    } catch (error) {
      return catchError('Event.allDeletedFeaSpeakerForSa', error, req, res)
    }
  }

  async deleteFeaSpeakerForSa (req, res, next) {
    try {
      const feaSpeaSa = await speakerCollModel.findByIdAndDelete(req.body.feaSpeakerId, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Feature speaker (${feaSpeaSa._id}) category has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'fea_spa_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteFeaSpeakerForSa', error, req, res)
    }
  }

  async addFeaSponsorForSa(req, res) {
    try {
      const sponsorName = new sponsorCollModel({
        superAdminId : req.body.superAdminId,
        categoryName : req.body.categoryName,
        sequence : req.body.sequence,
      })
      const superAdminId = req.body.superAdminId;
      const categoryName = req.body.categoryName;
      const sequence = req.body.sequence;
      const existingSponsorName = await sponsorCollModel.find({ superAdminId, categoryName});
      if (existingSponsorName.length) {
            if (existingSponsorName.superAdminId === req.body.superAdminId && existingSponsorName.categoryName === req.body.categoryName ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_nm_alr_spo')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_nm_fea_spo')
          }
        }
      const existingSequenceNumber = await sponsorCollModel.find({ superAdminId, sequence });
      if (existingSequenceNumber.length) {
            if (existingSequenceNumber.superAdminId === req.body.superAdminId && existingSequenceNumber.sequence === req.body.sequence ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_seq_alr_spo')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_seqc_fea_spo')
          }
        }
      await sponsorName.save()
      return response(req, res, status.Create, jsonStatus.Create, 'fea_partner_add', { status: 1, data: sponsorName })
    } catch (error) {  
    return catchError('Event.addFeaSponsorForSa', error, req, res)
    }
  }

  async editFeaSponsorForSa(req, res) {
    try { 
      const _id = req.body._id;
      const superAdminId = req.body.superAdminId;
      const categoryName = req.body.categoryName;
      const sequence = req.body.sequence;
      const existingSponsorName = await sponsorCollModel.findOne({ _id : { $ne : _id }, superAdminId, categoryName});
      if (existingSponsorName) {
            // if (existingSponsorName._id === req.body._id && existingSponsorName.superAdminId === req.body.superAdminId && existingSponsorName.categoryName === req.body.categoryName ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_nm_alr_spo')
          // } else {
          //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_nm_fea_spo')
          // }
        }
      const existingSequenceNumber = await sponsorCollModel.findOne({ _id : { $ne : _id }, superAdminId, sequence });
      if (existingSequenceNumber) {
            // if (existingSponsorName._id === req.body._id && existingSponsorName.superAdminId === req.body.superAdminId && existingSequenceNumber.sequence === req.body.sequence ) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'fea_seq_alr_spo')
          // } else {
          //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'alr_seqc_fea_spo')
          // }
        }
        const sponsorName = await sponsorCollModel.findByIdAndUpdate( req.body._id, {
          categoryName : req.body.categoryName,
          sequence : req.body.sequence,
          status : 1,
        }, {new: true });
      await sponsorName.save()
      return response(req, res, status.OK, jsonStatus.OK, 'fea_spon_upd', { status: 1, data: sponsorName })
    } catch (error) {  
    return catchError('Event.editFeaSponsorForSa', error, req, res)
    }
  }

  async allFeaSponsorForSa (req, res) {
    try {
      const sponsorName = await sponsorCollModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsorName })
    } catch (error) {
      return catchError('Event.allFeaSponsorForSa', error, req, res)
    }
  }

  async feaSponsorForSaDetail (req, res , next)  {
    try {
      const feaSponsorId = req.body.feaSponsorId;
      const sponsorName = await sponsorCollModel.findById(feaSponsorId);
      if (!sponsorName) return next(new Error('feature sponsor does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsorName })
    } catch (error) {  
      return catchError('Event.feaSponsorForSaDetail', error, req, res)
    }
  }

  async allDeletedFeaSponsorForSa (req, res) {
    try {
      const sponsorName = await sponsorCollModel.find( { status : [ -1 ] } ).sort({_id:-1 });
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: sponsorName })
    } catch (error) {
      return catchError('Event.allDeletedFeaSponsorForSa', error, req, res)
    }
  }

  async deleteFeaSponsorForSa (req, res, next) {
    try {
      const feaSponSa = await sponsorCollModel.findByIdAndDelete(req.body.feaSponsorId, { status: -1 , deleted_by : req.body.superAdminId });
      logger.warn(`Feature sponsor (${feaSponSa._id}) category has been deleted by ${req.body.superAdminId} at`)
      return response(req, res, status.OK, jsonStatus.OK, 'fea_spo_dlt', { status: 1 })    
    } catch (error) {  
      return catchError('Event.deleteFeaSponsorForSa', error, req, res)
    }
  }

  async eventDetail (req, res ) {
    // const eveDetail = await eventModel.aggregate([ 
    //   {$skip:0},{$limit: 1000},
    //   {$lookup:{from:"speaker", localField:"speakerId", foreignField:"eventId", as:"speakerDetail"}},
    //   {$lookup:{from:"sponsor", localField:"sponsorId", foreignField:"eventId", as:"sponsorDetail"}},
    //   {$lookup:{from:"partner", localField:"partnerId", foreignField:"eventId", as:"partnerDetail"}},
    //   {$project: {productpoint:1,productname:1,productcode:1,productid:1,group: { $arrayElemAt: [ "$group", 0 ]},
    //               category: { $arrayElemAt: [ "$category", 0 ]}, division: { $arrayElemAt: [ "$division", 0 ]} }} 
    // ]);



    try {



    // const eventDetail = await eventModel.aggregate([
    //     /** groups data & sum up charges */
    //     { $group: { _id: { date: '$_id.date', customerId: '$_id.customerId', sellerId: '$_id.sellerId' }, totalCharges: { $sum: '$charges' } } },
    //     /** finds matching docs from sample2 */
    //     {
    //         $lookup:
    //         {
    //             from: "sample2",
    //             let: { customerId: '$_id.customerId', sellerId: '$_id.sellerId' },
    //             pipeline: [
    //                 {
    //                     $match:
    //                     {
    //                         $expr:
    //                         {
    //                             $and:
    //                                 [
    //                                     { $eq: ["$customerId", "$$customerId"] },
    //                                     { $eq: ["$sellerId", "$$sellerId"] }
    //                                 ]
    //                         }
    //                     }
    //                 },
    //                 { $project: { amount: 1, _id: 0 } }
    //             ],
    //             as: "TotalEvent" // TotalEvent is an array of objects, each object will have just amount field in it.
    //         }
    //     },
    //     /** retains only needed fields  */
    //     {
    //         $project: {
    //             totalCharges: 1, speakers: {
    //                 $subtract: ['$totalCharges', {
    //                     $reduce: {
    //                         input: '$TotalEvent',
    //                         initialValue: 0,
    //                         in: { $add: ["$$value", "$$this.amount"] }
    //                     }
    //                 }]
    //             }, TotalEvent: {
    //                 $reduce: {
    //                     input: '$TotalEvent',
    //                     initialValue: 0,
    //                     in: { $add: ["$$value", "$$this.amount"] }
    //                 }
    //             }
    //         }
    //     }
    // ])
    


      const speakers = await speakerModel.find( { status : [ 1 ] , eventId : req.body.eventId } ).populate({path: 'eventId', select: ['name', 'email']});
      const partners = await partnerModel.find( { status : [ 1 ] , eventId : req.body.eventId } );
      const sponsors = await sponsorModel.find( { status : [ 1 ] , eventId : req.body.eventId } );
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [{speakers, partners, sponsors}] })
      // return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: eventDetail })

    } catch (error) {
      return catchError('Event.eventDetail', error, req, res)
    }
  }

  async eveBulkUploadOld (req, res, next) {
    try {
    // var temp;
    // csv()
    // .fromFile(req.file.path)
    // .then((jsonObj) => {
    //   console.log(jsonObj);
    //   //the jsonObj will contain all the data in JSONFormat.
    //   //but we want columns Test1,Test2,Test3,Test4,Final data as number .
    //   //becuase we set the dataType of these fields as Number in our mongoose.Schema().
    //   //here we put a for loop and change these column value in number from string using parseFloat().
    //   //here we use parseFloat() beause because these fields contain the float values.
    //   for (var x = 0; x < jsonObj; x++) {
    //     temp = parseFloat(jsonObj[x].Test1);
    //     jsonObj[x].Test1 = temp;
    //     temp = parseFloat(jsonObj[x].Test2);
    //     jsonObj[x].Test2 = temp;
    //     temp = parseFloat(jsonObj[x].Test3);
    //     jsonObj[x].Test3 = temp;
    //     temp = parseFloat(jsonObj[x].Test4);
    //     jsonObj[x].Test4 = temp;
    //     temp = parseFloat(jsonObj[x].Final);
    //     jsonObj[x].Final = temp;
    //   }
    //   eventModel.insertMany(jsonObj, (err, data) => {
      var temp;
      csv()
      .fromFile(req.file.path)
      .then((jsonObj) => {
        let jsObj = [];
        for (let x in jsonObj) {
          jsObj.push({
            "organizationId": req.body.organizationId,
            "name": jsonObj[x].name,
            description: jsonObj[x].description,
            communication: jsonObj[x].communication,
            timezone: jsonObj[x].timezone,
            date: jsonObj[x].date,
            starts_at: jsonObj[x].starts_at,
            ends_at: jsonObj[x].ends_at,
            default_event_url: jsonObj[x].default_event_url,
            custom_url: jsonObj[x].custom_url,
            url_type: jsonObj[x].url_type,
            theme_colorone: jsonObj[x].theme_colorone,
            theme_colortwo: jsonObj[x].theme_colortwo,
            banner: jsonObj[x].banner,
            logo: jsonObj[x].logo,
          })
        }
        // console.log("Json: ", jsObj)
        eventModel.insertMany(jsObj, (err, data) => {
        if (err) {
          console.log("Getting error while read event bulk upload csv :",err);
        } else {
          // res.redirect("/");
          return response(req, res, status.OK, jsonStatus.OK, 'eve_bulk_upl', { status: 1 }) 
        }
      });
    });
    } catch (error) {  
      return catchError('Event.eveBulkUploadOld', error, req, res)
    }
  }

  async eveBulkUpload(req, res) {
    const fileRows = [];
    let event_duplicateData = [];
    let event_succesData = [];
    let event_invalid = [];

    const dbId = await eventModel.find({
      organizationId: req.body.organizationId,
    });

    if (dbId.length > 0) {
      // open uploaded file
      csv
        .parseFile(req.file.path)
        .on("data", function (data) {
          fileRows.push(data); // push each row
        })
        .on("end", async function () {
          fs.unlinkSync(req.file.path); // remove temp file

          const validationError = await eventValidateCsvData(fileRows);

          /****************************  Invalide CSV Format **************************************/

          if (validationError) {
            res.json({
              code: 400,
              message: "Invalid csv format please check sample csv.",
            });
          } else {
            /****************************  All Records Are Duplicat **************************************/

            if (
              event_succesData.length === 0 &&
              event_invalid.length == 0 &&
              event_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message: "All records are duplicate.",
              });
            }
            /****************************  Sucess & Duplicat **************************************/

            if (
              event_succesData.length > 0 &&
              event_invalid.length == 0 &&
              event_duplicateData.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows: ${event_succesData.length} , Duplicate rows : ${event_duplicateData.length} `,
              });
            }
            /****************************  invalid & Duplicat **************************************/

            if (
              event_succesData.length == 0 &&
              event_invalid.length > 0 &&
              event_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message: `Invalid rows : ${event_invalid.length} , Duplicate rows: ${event_duplicateData.length} `,
              });
            }
            /****************************  Sucess  **************************************/

            if (
              event_succesData.length > 0 &&
              event_invalid.length == 0 &&
              event_duplicateData.length == 0
            ) {
              return res.json({
                code: 200,
                message: ` Add rows : ${event_succesData.length}`,
              });
            }
            /****************************  invlide   **************************************/

            if (
              event_duplicateData.length == 0 &&
              event_invalid.length > 0 &&
              event_succesData.length == 0
            ) {
              return res.json({
                code: 400,
                message: " All rows are invalid.",
              });
            }

            /****************************  invlide & Success & Duplicate **************************************/

            if (
              event_succesData.length > 0 &&
              event_duplicateData.length > 0 &&
              event_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Duplicate rows : ${event_duplicateData.length} , Add rows:${event_succesData.length} , Invalid rows : ${event_invalid.length} `,
              });
            }
            /****************************  invlide & Success  **************************************/

            if (
              event_succesData.length > 0 &&
              event_duplicateData.length == 0 &&
              event_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows:${event_succesData.length} , Invalid rows : ${event_invalid.length} `,
              });
            }
          }
        });
    } else {
      return res.json({
        code: 400,
        // message: 'Organization does not exist.',
        message: 'You need to add atleast one data for bulk upload.',
      });
    }

    // ============================ Error message through  =============================>
    async function eventValidateCsvData(rows) {
      try {
        if (
          rows[0][0] == "name" &&
          rows[0][1] == "starts_at" &&
          rows[0][2] == "ends_at" &&
          rows[0][3] == "default_event_url" &&
          rows[0][4] == "theme_colorone" &&
          rows[0][5] == "theme_colortwo" &&
          rows[0][6] == "stage" &&
          rows[0][7] == "sessions" &&
          rows[0][8] == "networking" &&
          rows[0][9] == "expo"
        ) {
          const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows

          let rowObjs = dataRows.map((x) => ({
            name: x[0],
            starts_at: x[1],
            ends_at: x[2],
            default_event_url: x[3],
            theme_colorone: x[4],
            theme_colortwo: x[5],
            stage: x[6],
            sessions: x[7],
            networking: x[8],
            expo: x[9],
          }));

          let objectValidate = false;

          for (let i = 0; i < rowObjs.length; i++) {
            //////////// name ///////////////////

            if (rowObjs[i].name) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            //////////// default_event_url ///////////////////
            if (rowObjs[i].default_event_url && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            //////////// theme_colorone ///////////////////
            if (rowObjs[i].theme_colorone && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            //////////// theme_colortwo ///////////////////
            if (rowObjs[i].theme_colortwo && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            //////////// stage ///////////////////
            if (rowObjs[i].stage && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            //////////// sessions ///////////////////
            if (rowObjs[i].sessions && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            //////////// networking ///////////////////
            if (rowObjs[i].networking && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            //////////// expo ///////////////////
            if (rowObjs[i].expo && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            if (rowObjs[i].starts_at && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
            if (rowObjs[i].ends_at && objectValidate) {
              // objectValidate = true;

              const csv_start_date = new Date(rowObjs[i].starts_at);
              const csv_end_date = new Date(rowObjs[i].ends_at);

              if (
                csv_start_date.valueOf() < csv_end_date.valueOf() &&
                csv_end_date.valueOf() > csv_start_date.valueOf()
              ) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }

            if (objectValidate) {
              // expo
              let expo = false;
              if (rowObjs[i].expo == "Yes" || rowObjs[i].expo == "yes") {
                expo = true;
              }
              // stage
              let stage = false;
              if (rowObjs[i].stage == "Yes" || rowObjs[i].stage == "yes") {
                stage = true;
              }

              // sessions
              let sessions = false;
              if (rowObjs[i].sessions == "Yes" || rowObjs[i].sessions == "yes") {
                sessions = true;
              }

              // networking
              let communicationTrunery = "Both";
              let networkingTrunery = true;
              if (
                rowObjs[i].networking == "no" ||
                rowObjs[i].networking == "No"
              ) {
                communicationTrunery = "";
                networkingTrunery = false;
              }

              // event Url

              let url_type = "Custom_Url";
              let default_event_url = `${process.env.DEFAULT_EVENT_URL}/voe/voeevent/`;
              let custom_url = "7326c17f-d4f5-460b-b7b5-a26cf9291b9b";
              let banner_path = "public/files/1653459601700.jpg";
              let logo_path = "public/files/1653459601477.png";
              let eve_logo_sly_path = "public/files/1654077926388.png";

              if (
                rowObjs[i].default_event_url == "yes" ||
                rowObjs[i].default_event_url == "Yes"
              ) {
                url_type = "Default_Url";
              }

              // theme color-1

              let theme_colorOne = "";

              if (rowObjs[i].theme_colorone) {
                let coloure_one = rowObjs[i].theme_colorone;
                let indexof_Color_one = coloure_one.indexOf("#");
                let lengthCheck_color_one = coloure_one.split("#")[1];

                if (indexof_Color_one === 0) {
                  if (
                    lengthCheck_color_one.length >= 3 &&
                    lengthCheck_color_one.length <= 6
                  ) {
                    theme_colorOne = coloure_one;
                  }
                }
              }

              // theme color-2
              let theme_colortwo = "";

              if (rowObjs[i].theme_colortwo) {
                let coloure_two = rowObjs[i].theme_colortwo;
                let indexof_Color_two = coloure_two.indexOf("#");
                let lengthCheck_color_two = coloure_two.split("#")[1];

                if (indexof_Color_two === 0) {
                  if (
                    lengthCheck_color_two.length >= 3 &&
                    lengthCheck_color_two.length <= 6
                  ) {
                    theme_colortwo = coloure_two;
                  }
                }
              }
              // <----============= Delarations ==================--------->
              const start_date = new Date(rowObjs[i].starts_at);
              let dateFormation = start_date.toISOString().split("T")[0];
              let deleted_by = "";
              let deleted_by_org = "";
              let description =
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
              let eventCancelDate = null;
              let eventPostPondDate = null;
              let eventRescheduleDate = null;
              let isActive = false;
              let is_cancel = false;
              let is_postponed = false;
              let is_reschedule = false;
              let isDecline = false;
              let organizationId = req.body.organizationId;
              let status = 1;
              let superAdminId = "624ac82a712c65e55bd0f7da";
              let timezone = "Asia/Kolkata (GMT+05:30)";

              /******************** STOR TO DB ***************************/

              let isInsert = false;
              for (let item = 0; item < dbId.length; item++) {
                let DB_dateFormation = new Date(
                  dbId[item].starts_at
                ).toLocaleDateString();
                let csv_dateFormation = new Date(
                  rowObjs[i].starts_at
                ).toLocaleDateString();

                if (DB_dateFormation === csv_dateFormation) {
                  if (dbId[item].name != rowObjs[i].name) {
                    isInsert = true;
                  } else {
                    event_duplicateData.push(rowObjs[i]);
                    isInsert = false;
                    break;
                  }
                } else {
                  isInsert = true;
                }
              }

              if (isInsert) {
                const speaker = new eventModel({
                  name: rowObjs[i].name,
                  starts_at: rowObjs[i].starts_at,
                  ends_at: rowObjs[i].ends_at,
                  default_event_url: default_event_url,
                  custom_url: custom_url,
                  url_type: url_type,
                  date: dateFormation,
                  communication: communicationTrunery,
                  expo: expo,
                  stage: stage,
                  sessions: sessions,
                  theme_colorone: theme_colorOne,
                  theme_colortwo: theme_colortwo,
                  banner: banner_path,
                  logo: logo_path,
                  eve_logo_sly: eve_logo_sly_path,
                  networking: networkingTrunery,
                  deleted_by: deleted_by,
                  deleted_by_org: deleted_by_org,
                  description: description,
                  eventCancelDate: eventCancelDate,
                  eventPostPondDate: eventPostPondDate,
                  eventRescheduleDate: eventRescheduleDate,
                  isActive: isActive,
                  isDecline: isDecline,
                  is_cancel: is_cancel,
                  is_postponed: is_postponed,
                  is_reschedule: is_reschedule,
                  organizationId: organizationId,
                  status: status,
                  superAdminId: superAdminId,
                  timezone: timezone,
                });

                speaker.save();
                event_succesData.push(rowObjs[i]);
              }
            } else {
              event_invalid.push(rowObjs[i]);
            }
          }
        } else {
          return "Invalid csv format please check sample csv.";
        }
      } catch (error) {  
        return catchError('Event.eveBulkUpload', error, req, res)
      }
    }
  };

  async expoBoothBulkUploadOld(req, res) {
    try {
       const fileRows_expo = [];
       csv
          .parseFile(req.file.path)
          .on("data", function (data) {
             fileRows_expo.push(data); // push each row
          })
          .on("end", function () {
             fs.unlinkSync(req.file.path); // remove temp file
             const validationError = validateCsvData(fileRows_expo);
             if (validationError) {
                return res.status(403).json({
                   error: validationError
                });
             } else {
                // checkUniqeName(fileRows);
             }
             return response(req, res, status.OK, jsonStatus.OK, 'expo_bulk_upl', {
              status: 1
             })
          });
 
       function validateCsvData(expo_row) {
          try {
             const dataRows = expo_row.slice(1, expo_row.length); //ignore header at 0 and get rest of the rows
             let dataRow = dataRows.map((x) => ({
                name: x[0],
                description: x[1],
                address: x[2],
                email: x[3],
                phone_number: x[4],
                username_email: x[5],
             }));
 
        // uniqe CSV username_email
        const key = "username_email";
        const rowObjs = [
          ...new Map(dataRow.map((item) => [item[key], item])).values(),
        ];

             // console.log("Row Object:", rowObjs );
             let objectValidate = false;
             // final_Expo_list = [];
 
             for (let i = 0; i < rowObjs.length; i++) {
                // Name
                if (rowObjs[i].name) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                }
                // Description
                if (rowObjs[i].description && objectValidate) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                }
                // Address
                if (rowObjs[i].address && objectValidate) {
                   objectValidate = true;
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
                // number
                if (rowObjs[i].phone_number && objectValidate) {
                   let number = rowObjs[i].phone_number;
                   var validatNumber = /^[0-9]+$/;
                   if (number.length <= 10 && number.match(validatNumber)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
 
                // user Email
                if (rowObjs[i].username_email && objectValidate) {
                   let userEmail = rowObjs[i].username_email;
                   let ValidateUserEmail =
                      /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
                   if (userEmail.match(ValidateUserEmail)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
                if (objectValidate) {
                   expoStoreDb(rowObjs[i]);
                }
             }
          } catch (error) {
             console.log("Validate Cvs data error:", error);
          }
       }
       let expoStoreDb = async (data) => {
        try {
          const eventID = await expoModel.find({
            eventId: req.body.eventId,
          });
          if (eventID) {
            const isEmailExist = eventID.find(
              (item) => item.username_email === data.username_email
            );
  
            if (!isEmailExist) {
              const expo = await new expoModel({
                eventId: req.body.eventId,
                name: data.name,
                description: data.description,
                address: data.address,
                email: data.email,
                phone_number: data.phone_number,
                username_email: data.username_email,
              });
              const user = new userModel({
                eventId: req.body.eventId,
                email: data.username_email,
                name: data.name,
                role: 'expo'
             });
              await expo.save();
              await user.save();
            } else {
              console.log("Email ID already exist....");
            }
          } else {
            console.log("event ID does not exist....");
          }
        } catch (error) {
          console.log("Error:", error);
        }
      };
    } catch (error) {
      return catchError('Event.expoBoothBulkUpload', error, req, res)
   }
  }

  async expoBoothBulkUpload(req, res) {
    const fileRows_expo = [];
    let expo_duplicateData = [];
    let expo_succesData = [];
    let expo_invalidData = [];
  
    const dbId = await expoModel.find({
      eventId: req.body.eventId,
    });
    try {
      if (dbId.length > 0) {
        csv
          .parseFile(req.file.path)
          .on("data", function (data) {
            fileRows_expo.push(data); // push each row
          })
          .on("end", async function () {
            fs.unlinkSync(req.file.path); // remove temp file
  
            const validationError = await expo_validateCsvData(fileRows_expo);
            
            /****************************  Invalide CSV Format **************************************/
  
            if (validationError) {
              res.json({
                code: 400,
                message: "Invalid csv format please check sample csv.",
              });
            }
  
            /****************************  All Records Are Duplicat **************************************/
           
            if (
              expo_succesData.length == 0 &&
              expo_invalidData.length == 0 &&
              expo_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message: "All rows are duplicate.",
              });
            }
  
            /****************************  Sucess & Duplicat **************************************/
  
            if (
              expo_succesData.length > 0 &&
              expo_invalidData.length == 0 &&
              expo_duplicateData.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows: ${expo_succesData.length} , Duplicate rows : ${expo_duplicateData.length} `
              });
            }
  
            /****************************  invalid & Duplicat **************************************/
  
            if (
              expo_succesData.length == 0 &&
              expo_invalidData.length > 0 &&
              expo_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message: `Invalid rows : ${expo_invalidData.length} , Duplicate rows: ${expo_duplicateData.length} `
                // {
                //   "Invalide_Rows :": expo_invalidData.length,
                //   "Duplicate_Rows :": expo_duplicateData.length,
                // },
              });
            }
  
            /****************************  Sucess  **************************************/
  
            if (
              expo_succesData.length > 0 &&
              expo_invalidData.length == 0 &&
              expo_duplicateData.length == 0
            ) {
              return res.json({
                code: 200,
                message:` Add rows : ${expo_succesData.length}`
                //  {
                //   "Expo_Add :": expo_succesData.length,
                // },
              });
            }
  
            /****************************  invlide   **************************************/
  
            if (
              expo_duplicateData.length == 0 &&
              expo_invalidData.length > 0 &&
              expo_succesData.length == 0
            ) {
              return res.json({
                code: 400,
                // message: "sponsor Imported :" + Sponsor_sucessData.length,
                message: " All rows are invalid.",
              });
            }
  
            /****************************  invlide & Success & Duplicate **************************************/
  
            if (
              expo_succesData.length > 0 &&
              expo_duplicateData.length > 0 &&
              expo_invalidData.length > 0
            ) {
              return res.json({
                code: 200, 
                message: `Duplicate rows : ${expo_duplicateData.length} , Add rows:${expo_succesData.length} , Invalid rows : ${expo_invalidData.length} `
                // {
                //   "Duplicate_Rows :": expo_duplicateData.length,
                //   "expo_Add :": expo_succesData.length,
                //   "Invalide_Rows :": expo_invalidData.length,
                // },
              });
            }
  
            if (
              expo_succesData.length > 0 &&
              expo_duplicateData.length == 0 &&
              expo_invalidData.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows:${expo_succesData.length} , Invalid rows : ${expo_invalidData.length} `
                //  {
                //   "expo_Add ": expo_succesData.length,
                //   "Invalide_Rows ": expo_invalidData.length,
                // },
              });
            }
          });
      } else {
        return res.json({
          code: 400,
          // message: `This event id does not exist :  ${req.body.eventId}`
          message: 'You need to add atleast one data for bulk upload.'
        });
      }
    } catch (error) {
      console.log("Error:", error);
    }
  
    async function expo_validateCsvData(expo_row) {
      try {
        if (
          expo_row[0][0] == "name" &&
          expo_row[0][1] == "description" &&
          expo_row[0][2] == "address" &&
          expo_row[0][3] == "email" &&
          expo_row[0][4] == "phone_number" &&
          expo_row[0][5] == "username_email"
        ) {
          const dataRows = expo_row.slice(1, expo_row.length); //ignore header at 0 and get rest of the rows
          let dataRow = dataRows.map((x) => ({
            name: x[0],
            description: x[1],
            address: x[2],
            email: x[3],
            phone_number: x[4],
            username_email: x[5],
          }));
  
          // uniqe CSV username_email
          const key = "username_email";
          const rowObjs = [
            ...new Map(dataRow.map((item) => [item[key], item])).values(),
          ];
  
          let objectValidate = false;
          // final_Expo_list = [];
          for (let i = 0; i < rowObjs.length; i++) {
            // Name
            if (rowObjs[i].name) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
  
            // Description
            if (rowObjs[i].description && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
  
            // Address
            if (rowObjs[i].address && objectValidate) {
              objectValidate = true;
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
            // number
            if (rowObjs[i].phone_number && objectValidate) {
              let number = rowObjs[i].phone_number;
              var validatNumber = /^[0-9]+$/;
              if (number.length <= 10 && number.match(validatNumber)) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }
  
            // user Email
            if (rowObjs[i].username_email && objectValidate) {
              let userEmail = rowObjs[i].username_email;
              let ValidateUserEmail =
                /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
              if (userEmail.match(ValidateUserEmail)) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }
            if (objectValidate) {
              // expoStoreDb(rowObjs[i]);
              try {
                const eventID = await expoModel.find({
                  eventId: req.body.eventId,
                });
                const isEmailExist = await eventID.find(
                  (item) => item.username_email === rowObjs[i].username_email
                );
                if (!isEmailExist) {
                  const expo = await new expoModel({
                    name: rowObjs[i].name,
                    description: rowObjs[i].description,
                    address: rowObjs[i].address,
                    email: rowObjs[i].email,
                    phone_number: rowObjs[i].phone_number,
                    username_email: rowObjs[i].username_email,
                    eventId: req.body.eventId,
                    website: "",
                    banner:"",
                    youtube_embed_url: "",
                    product_catalouge: "",
                    facebook: "",
                    instagram: "",
                    twitter: "",
                    linkedin: "",
                    status: 1,
                    deleted_by: "",
                  });
                  const user = await new userModel({
                    name: rowObjs[i].name,
                    // description: rowObjs[i].description,
                    address: rowObjs[i].address,
                    // email: rowObjs[i].email,
                    email : rowObjs[i].username_email, //change for bulk email
                    phone_number: rowObjs[i].phone_number,
                    username_email: rowObjs[i].username_email,
                    eventId: req.body.eventId,
                    status: 1,
                    role: "expo",
                    logo: "",
                  });
                  const emailPassword = generateRandomPassword().toString(); 
                  const hashedPassword = await hashPassword(emailPassword); 
                  console.log(`The generated credential is ${emailPassword}`);
                  var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
                  const event = await eventModel.findById(req.body.eventId);
                  // console.log(event);
                  var eventDetails;
                  if (event) {
                    eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
                  }
                  sendEmailCred(emailPassword, expo.username_email, 'VOE:Expo Credential', true, eventDetails)
                  user.password = hashedPassword; // Updating the password
                  expo.password = hashedPassword; // Updating the password
                  await expo.save();
                  await user.save();
                  // console.log("save data:",  rowObjs[i]);
                  expo_succesData.push(rowObjs[i]);
                } else {
                  expo_duplicateData.push(rowObjs[i]);
                }
              } catch (error) {
                console.log("Error:", error);
              }
            } else {
              expo_invalidData.push(rowObjs[i]);
            }
          }
        } else {
          return "Invalid csv format please check sample csv.";
        }
  
        // return {
        //   expo_succesData: expo_succesData,
        //   expo_duplicateData: expo_duplicateData,
        // };
        // console.log("expo_duplicateData after for ", expo_duplicateData);
      } catch (error) {  
        return catchError('Event.expoBoothBulkUpload', error, req, res)
      }
    }
  };

  async speBulkUploadOld(req, res) {
    try {
       const fileRows_speaker = [];
       // open uploaded file
       csv
          .parseFile(req.file.path)
          .on("data", function (data) {
             fileRows_speaker.push(data); // push each row
          })
          .on("end", async function () {
             fs.unlinkSync(req.file.path); // remove temp file
             const validationError = await validateCsvData(fileRows_speaker);
             if (validationError) {
                return res.status(403).json({
                   error: validationError
                });
             } else {
                // checkUniqeName(fileRows);
             }
             return response(req, res, status.OK, jsonStatus.OK, 'spe_bulk_upl', {
              status: 1
             })
          });
  
       async function validateCsvData(speaker_row) {
          try {
             const dataRows = speaker_row.slice(1, speaker_row.length); //ignore header at 0 and get rest of the rows
             let dataRow = dataRows.map((x) => ({
                name: x[0],
                description: x[1],
                // address: x[2],
                email: x[2],
                phone_number: x[3],
                username_email: x[4],
             }));

        // uniqe CSV username_email
        const key = "username_email";
        const rowObjs = [
          ...new Map(dataRow.map((item) => [item[key], item])).values(),
        ];

             // console.log("Row Object:", rowObjs );
             let objectValidate = false;
             // final_Expo_list = [];
             for (let i = 0; i < rowObjs.length; i++) {
                // Name
                if (rowObjs[i].name) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                } 
                // Description
                if (rowObjs[i].description && objectValidate) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                } 
                // Address
                // if (rowObjs[i].address && objectValidate) {
                //   objectValidate = true;
                // } else {
                //   objectValidate = false;
                // }
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
                // number
                if (rowObjs[i].phone_number && objectValidate) {
                   let number = rowObjs[i].phone_number;
                   var validatNumber = /^[0-9]+$/;
                   if (number.length <= 10 && number.match(validatNumber)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
                // user Email
                if (rowObjs[i].username_email && objectValidate) {
                   let userEmail = rowObjs[i].username_email;
                   let ValidateUserEmail =
                      /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
                   if (userEmail.match(ValidateUserEmail)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
                if (objectValidate) {
                   await speakerStoreDb(rowObjs[i]);
                }
             }
          } catch (error) {
             console.log("Validate Cvs data error:", error);
          }
       }
 
       let speakerStoreDb = async (data) => {
        try {
          const eventID = await speakerModel.find({
            eventId: req.body.eventId,
          });
          if (eventID) {
            const isEmailExist = eventID.find(
              (item) => item.username_email === data.username_email
            );
  
            if (!isEmailExist) {
              const speaker = new speakerModel({
                eventId: req.body.eventId,
                name: data.name,
                description: data.description,
                email: data.email,
                phone_number: data.phone_number,
                username_email: data.username_email,
              });
              
              const user = new userModel({
                eventId: req.body.eventId,
                email: data.username_email,
                name: data.name,
                role: 'speaker'
              });
              await speaker.save();
              await user.save();
              console.log(data.username_email, ": is Save in DataBase");
            } else {
              console.log("Email ID already exist....");
              // return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'some_email_alr_ext_event', {
              //   status: 1
              //  })
              }
          } else {
            console.log("event ID does not exist....");
          }
        } catch (error) {
          console.log("Error:", error);
        }
       };
    } catch (error) {
       return catchError('Event.speBulkUploadOld', error, req, res)
    }
  }

  async speBulkUpload(req, res) {
    const fileRows_speaker = [];
    let Speaker_SuccessData = [];
    let speaker_duplicateData = [];
    let speaker_invalid = [];
  
    const dbId = await speakerModel.find({
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
  
            /****************************  Invalide CSV Format **************************************/
  
            if (validationError) {
              res.json({
                code: 400,
                message: "Invalid csv format please check sample csv.",
              });
            }
  
            /****************************  All Records Are Duplicat **************************************/
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
  
            /****************************  Sucess & Duplicat **************************************/
  
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_invalid.length == 0 &&
              speaker_duplicateData.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Add rows : ${Speaker_SuccessData.length} , Duplicate rows : ${speaker_duplicateData.length}`
                //  {
                //   "Speaker Success  :": Speaker_SuccessData.length,
                //   "Duplicate Rows :": speaker_duplicateData.length,
                // },
              });
            }
  
            /****************************  invalid & Duplicate **************************************/
  
            if (
              Speaker_SuccessData.length == 0 &&
              speaker_invalid.length > 0 &&
              speaker_duplicateData.length > 0
            ) {
              return res.json({
                code: 400,
                message:`Invalid rows : ${speaker_invalid.length} , Duplicate rows   : ${speaker_duplicateData.length}`
                //  {
                //   "Invalide Row :": speaker_invalid.length,
                //   "Duplicate Rows :": speaker_duplicateData.length,
                // },
              });
            }
  
            /****************************  Sucess  **************************************/
  
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_invalid.length == 0 &&
              speaker_duplicateData.length == 0
            ) {
              return res.json({
                code: 200,
                message:` Add rows : ${Speaker_SuccessData.length}`
                // {
                //   "speaker ADD :": Speaker_SuccessData.length,
                // },
              });
            }
  
            /****************************  invlide   **************************************/
  
            if (
              speaker_duplicateData.length == 0 &&
              speaker_invalid.length > 0 &&
              Speaker_SuccessData.length == 0
            ) {
              return res.json({
                code: 400,
                // message: "sponsor Imported :" + Sponsor_sucessData.length,
                message: " All rows are invalid.",
              });
            }
  
            /****************************  invlide & Success & Duplicate **************************************/
  
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_duplicateData.length > 0 &&
              speaker_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message: `Duplicate rows : ${speaker_duplicateData.length} , Add rows : ${Speaker_SuccessData.length}, Invalid rows : ${speaker_invalid.length}`
                // {
                //   "Duplicate Rows :": speaker_duplicateData.length,
                //   "speaker add :": Speaker_SuccessData.length,
                //   "Invalide Rows :": speaker_invalid.length,
                // },
              });
            }
  
            /****************************  invlide & Success  **************************************/
  
            if (
              Speaker_SuccessData.length > 0 &&
              speaker_duplicateData.length == 0 &&
              speaker_invalid.length > 0
            ) {
              return res.json({
                code: 200,
                message:`Add rows : ${Speaker_SuccessData.length} , Invalid rows : ${speaker_invalid.length}`
                //  {
                //   "Speaker Add ": Speaker_SuccessData.length,
                //   "Invalid Rows ": speaker_invalid.length,
                // },
              });
            }
  
            // if (Speaker_SuccessData.length == 0) {
            //   return res.json({
            //     code: 400,
            //     message: "All Records are Duplicate",
            //   });
            // }
            // if (speaker_duplicateData.length == 0) {
            //   return res.json({
            //     code: 200,
            //     message: "Speaker Imported :" + Speaker_SuccessData.length,
            //   });
            // }
  
            // if (Speaker_SuccessData.length > 0) {
            //   return res.json({
            //     code: 200,
            //     message: "Duplicate Record :" + speaker_duplicateData.length,
            //   });
            // }
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
  
    //<---------=========== validate CsvData Function =============----------->
  
    async function Speaker_validateCsvData(speaker_row) {
      try {
        if (
          speaker_row[0][0] == "name" &&
          speaker_row[0][1] == "description" &&
          speaker_row[0][2] == "address" &&
          speaker_row[0][3] == "email" &&
          speaker_row[0][4] == "phone_number" &&
          speaker_row[0][5] == "username_email"
        ) {
          const dataRows = speaker_row.slice(1, speaker_row.length); //ignore header at 0 and get rest of the rows
  
          let dataRow = dataRows.map((x) => ({
            name: x[0],
            description: x[1],
            address: x[2],
            email: x[3],
            phone_number: x[4],
            username_email: x[5],
          }));
  
          // uniqe CSV username_email
          const key = "username_email";
          const rowObjs = [
            ...new Map(dataRow.map((item) => [item[key], item])).values(),
          ];
  
          let objectValidate = false;
          // final_Expo_list = [];
  
          for (let i = 0; i < rowObjs.length; i++) {
            // Name
            if (rowObjs[i].name) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }
  
            // Description
            if (rowObjs[i].description && objectValidate) {
              objectValidate = true;
            } else {
              objectValidate = false;
            }

            // Address
            if (rowObjs[i].address && objectValidate) {
              objectValidate = true;
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
            // number
            if (rowObjs[i].phone_number && objectValidate) {
              let number = rowObjs[i].phone_number;
              var validatNumber = /^[0-9]+$/;
              if (number.match(validatNumber)) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
            } else {
              objectValidate = false;
            }
  
            // user Email
            if (rowObjs[i].username_email && objectValidate) {
              let userEmail = rowObjs[i].username_email;
              let ValidateUserEmail =
                /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
              if (userEmail.match(ValidateUserEmail)) {
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
                const eventID = await speakerModel.find({
                  eventId: req.body.eventId,
                });
  
                const isEmailExist = await eventID.find(
                  (item) => item.username_email === rowObjs[i].username_email
                );
  
                if (!isEmailExist) {
                  const speaker = await new speakerModel({
                    name: rowObjs[i].name,
                    description: rowObjs[i].description,
                    address: rowObjs[i].address,
                    email: rowObjs[i].email,
                    phone_number: rowObjs[i].phone_number,
                    username_email: rowObjs[i].username_email,
                    eventId: req.body.eventId,
                    website: "",
                    facebook: "",
                    instagram: "",
                    twitter: "",
                    linkedin: "",
                    address: rowObjs[i].address,
                    designation: "",
                    isFeatured: false,
                    speaker_list: "",
                    status: 1,
                    deleted_by: "",
                    avatar: "",
                  });
                  const user = await new userModel({
                    name: rowObjs[i].name,
                    // description: rowObjs[i].description,
                    address: rowObjs[i].address,
                    // email: rowObjs[i].email,
                    email : rowObjs[i].username_email, //change for bulk email
                    phone_number: rowObjs[i].phone_number,
                    username_email: rowObjs[i].username_email,
                    eventId: req.body.eventId,
                    role: "speaker",
                    status: 1,
                    logo: "",
                  });
                  const emailPassword = generateRandomPassword().toString(); 
                  const hashedPassword = await hashPassword(emailPassword); 
                  console.log(`The generated credential is ${emailPassword}`);
                  var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
                  const event = await eventModel.findById(req.body.eventId);
                  // console.log(event);
                  var eventDetails;
                  if (event) {
                    eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
                  }
                  sendEmailCred(emailPassword, speaker.username_email, 'VOE:Speaker Credential', true, eventDetails)
                  user.password = hashedPassword; // Updating the password
                  speaker.password = hashedPassword; // Updating the password
                  await speaker.save();
                  await user.save();
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
        return catchError('Event.speBulkUpload', error, req, res)
      }
    }
  };

  async sponBulkUploadOld(req, res) {
    try {
       const fileRows_sponsor = [];
       // open uploaded file
       csv
          .parseFile(req.file.path)
          .on("data", function (data) {
             fileRows_sponsor.push(data); // push each row
          })
          .on("end", function () {
             fs.unlinkSync(req.file.path); // remove temp file
             const validationError = validateCsvData(fileRows_sponsor);
             if (validationError) {
                return res.status(403).json({
                   error: validationError
                });
             } else {
                // checkUniqeName(fileRows);
             }
             return response(req, res, status.OK, jsonStatus.OK, 'spon_bulk_upl', {
                status: 1
             })
          });
  
       function validateCsvData(sponsor_row) {
          try {
             const dataRows = sponsor_row.slice(1, sponsor_row.length); //ignore header at 0 and get rest of the rows
             let dataRow = dataRows.map((x) => ({
                name: x[0],
                address: x[1],
                description: x[2],
                email: x[3],
                phone_number: x[4],
                username_email: x[5],
             }));
 
             const key = "username_email";
             const rowObjs = [
               ...new Map(dataRow.map((item) => [item[key], item])).values(),
             ];

             // console.log("Row Object:", rowObjs );
             let objectValidate = false;
             // final_Expo_list = [];
 
             for (let i = 0; i < rowObjs.length; i++) {
                // Name
                if (rowObjs[i].name) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                }
 
                // Description
                if (rowObjs[i].description && objectValidate) {
                   objectValidate = true;
                } else {
                   objectValidate = false;
                }
 
                // Address
                if (rowObjs[i].address && objectValidate) {
                   objectValidate = true;
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
                // number
                if (rowObjs[i].phone_number && objectValidate) {
                   let number = rowObjs[i].phone_number;
                   var validatNumber = /^[0-9]+$/;
                   if (number.length <= 10 && number.match(validatNumber)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
 
                // user Email
                if (rowObjs[i].username_email && objectValidate) {
                   let userEmail = rowObjs[i].username_email;
                   let ValidateUserEmail =
                      /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
                   if (userEmail.match(ValidateUserEmail)) {
                      objectValidate = true;
                   } else {
                      objectValidate = false;
                   }
                } else {
                   objectValidate = false;
                }
                if (objectValidate) {
                   sponsorStoreDb(rowObjs[i]);
                }
             }
          } catch (error) {
             console.log("Validate Cvs data error:", error);
          }
       }
 
       let sponsorStoreDb = async (data) => {
        try {
          // const dbId = await sponsorModel.findOne({
          //   username_email: data.username_email,
          // });
  
          const eventID = await sponsorModel.find({
            eventId: req.body.eventId,
          });
          if (eventID) {
            const isEmailExist = eventID.find(
              (item) => item.username_email === data.username_email
            );
  
            if (!isEmailExist) {
              const sponsor = new sponsorModel({
                eventId: req.body.eventId,
                name: data.name,
                description: data.description,
                address: data.address,
                email: data.email,
                phone_number: data.phone_number,
                username_email: data.username_email,
              });
              const user = new userModel({
                eventId: req.body.eventId,
                email: data.username_email,
                name: data.name,
                role: 'sponsor'
               });
              await sponsor.save();
              await user.save();
              console.log(data.username_email, ": is Save in DataBase");
            } else {
              console.log("Email ID already exist....");
            }
          } else {
            console.log("event ID does not exist....");
          }
        } catch (error) {
          console.log("Error:", error);
        }
       };
    } catch (error) {
       return catchError('Event.sponBulkUploadOld', error, req, res)
    }
  }

  async sponBulkUpload(req, res) {
    try {
      const fileRows_sponsor = [];
      let Sponsor_sucessData = [];
      let sponsor_duplicat = [];
      let invalide_Data = [];
  
      const dbId = await sponsorModel.find({
        eventId: req.body.eventId,
      });
  
      try {
        if (dbId.length > 0) {
          csv
            .parseFile(req.file.path)
            .on("data", function (data) {
              fileRows_sponsor.push(data); // push each row
            })
            .on("end", async function () {
              fs.unlinkSync(req.file.path); // remove temp file
  
              const validationError = await validateCsvData(fileRows_sponsor);
  
              /****************************  Invalide CSV Format **************************************/
  
              if (validationError) {
                res.json({
                  code: 400,
                  message: "Invalid csv format please check sample csv.",
                });
              }
  
              /****************************  All Records Are Duplicat **************************************/
              if (
                Sponsor_sucessData.length == 0 &&
                invalide_Data.length == 0 &&
                sponsor_duplicat.length > 0
              ) {
                return res.json({
                  code: 400,
                  message: "All rows are duplicate.",
                });
              }
  
              /****************************  Sucess & Duplicat **************************************/
  
              if (
                Sponsor_sucessData.length > 0 &&
                invalide_Data.length == 0 &&
                sponsor_duplicat.length > 0
              ) {
                return res.json({
                  code: 200,
                  message:`Add rows : ${Sponsor_sucessData.length}, Duplicate rows : ${sponsor_duplicat.length}`
                  //  {
                  //   "sponsor Imported :": Sponsor_sucessData.length,
                  //   "Duplicate Record :": sponsor_duplicat.length,
                  // },
                });
              }
  
              /****************************  invalid & Duplicat **************************************/
  
              if (
                Sponsor_sucessData.length == 0 &&
                invalide_Data.length > 0 &&
                sponsor_duplicat.length > 0
              ) {
                return res.json({
                  code: 400,
                  message: `Invalid rows : ${invalide_Data.length}, Duplicate rows : ${sponsor_duplicat.length}`
                  // {
                  //   "Invalide Data :": invalide_Data.length,
                  //   "Duplicate Record :": sponsor_duplicat.length,
                  // },
                });
              }
  
              /****************************  Sucess  **************************************/
  
              if (
                Sponsor_sucessData.length > 0 &&
                invalide_Data.length == 0 &&
                sponsor_duplicat.length == 0
              ) {
                return res.json({
                  code: 200,
                  message:`Add rows : ${Sponsor_sucessData.length}`
                  //  {
                  //   "sponsor Imported :": Sponsor_sucessData.length,
                  // },
                });
              }
  
              /****************************  invlide   **************************************/
  
              if (
                sponsor_duplicat.length == 0 &&
                invalide_Data.length > 0 &&
                Sponsor_sucessData.length == 0
              ) {
                return res.json({
                  code: 400,
                  // message: "sponsor Imported :" + Sponsor_sucessData.length,
                  message: " All rows are invalid.",
                });
              }
              /****************************  invlide & Success & Duplicate **************************************/
  
              if (
                Sponsor_sucessData.length > 0 &&
                sponsor_duplicat.length > 0 &&
                invalide_Data.length > 0
              ) {
                return res.json({
                  code: 200,
                  message:` Duplicate rows : ${sponsor_duplicat.length} , Add rows : ${Sponsor_sucessData.length}, Invalid rows : ${invalide_Data.length}`
                  //  {
                  //   "Duplicate Record :": sponsor_duplicat.length,
                  //   "sponsor Imported :": Sponsor_sucessData.length,
                  //   "Invalide Data :": invalide_Data.length,
                  // },
                });
              }
  
              /****************************  invlide & Success  **************************************/
  
              if (
                Sponsor_sucessData.length > 0 &&
                sponsor_duplicat.length == 0 &&
                invalide_Data.length > 0
              ) {
                return res.json({
                  code: 200,
                  message: `Add rows : ${Sponsor_sucessData.length}, Invalid rows : ${invalide_Data.length}`
                  //  {
                  //   "sponsor Imported ": Sponsor_sucessData.length,
                  //   "Invalide Data ": invalide_Data.length,
                  // },
                });
              }
            });
        } else {
          return res.json({
            code: 400,
            message: 'You need to add atleast one data for bulk upload.'
          });
        }
      } catch (error) {
        console.log("Error:", error);
      }
  
      async function validateCsvData(sponsor_row) {
        try {
          if (
            sponsor_row[0][0] == "name" &&
            sponsor_row[0][1] == "address" &&
            sponsor_row[0][2] == "description" &&
            sponsor_row[0][3] == "email" &&
            sponsor_row[0][4] == "phone_number" &&
            sponsor_row[0][5] == "username_email"
          ) {
            const dataRows = sponsor_row.slice(1, sponsor_row.length); //ignore header at 0 and get rest of the rows
            let dataRow = dataRows.map((x) => ({
              name: x[0],
              address: x[1],
              description: x[2],
              email: x[3],
              phone_number: x[4],
              username_email: x[5],
            }));
  
            const key = "username_email";
            const rowObjs = [
              ...new Map(dataRow.map((item) => [item[key], item])).values(),
            ];
  
            let objectValidate = false;
  
            for (let i = 0; i < rowObjs.length; i++) {
              // Name
              if (rowObjs[i].name) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
  
              // Description
              if (rowObjs[i].description && objectValidate) {
                objectValidate = true;
              } else {
                objectValidate = false;
              }
  
              // Address
              if (rowObjs[i].address && objectValidate) {
                objectValidate = true;
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
              // number
              if (rowObjs[i].phone_number && objectValidate) {
                let number = rowObjs[i].phone_number;
                var validatNumber = /^[0-9]+$/;
                if (number.match(validatNumber)) {
                  objectValidate = true;
                } else {
                  objectValidate = false;
                }
              } else {
                objectValidate = false;
              }
  
              // user Email
              if (rowObjs[i].username_email && objectValidate) {
                let userEmail = rowObjs[i].username_email;
                let ValidateUserEmail =
                  /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
                if (userEmail.match(ValidateUserEmail)) {
                  objectValidate = true;
                } else {
                  objectValidate = false;
                }
              } else {
                objectValidate = false;
              }
              if (objectValidate) {
                // sponsorStoreDb(rowObjs[i]);
                try {
                  // const dbId = await sponsorModel.findOne({
                  //   username_email: data.username_email,
                  // });
  
                  const eventID = await sponsorModel.find({
                    eventId: req.body.eventId,
                  });
  
                  const isEmailExist = await eventID.find(
                    (item) => item.username_email === rowObjs[i].username_email
                  );
  
                  if (!isEmailExist) {
                    const sponsor = await new sponsorModel({
                      name: rowObjs[i].name,
                      description: rowObjs[i].description,
                      address: rowObjs[i].address,
                      email: rowObjs[i].email,
                      phone_number: rowObjs[i].phone_number,
                      username_email: rowObjs[i].username_email,
                      eventId: req.body.eventId,
                      website: "",
                      youtube_embed_url: "",
                      product_catalouge: "",
                      facebook: "",
                      instagram: "",
                      twitter: "",
                      linkedin: "",
                      isFeatured: false,
                      sponsor_list: "",
                      banner_cat: "",
                      status: 1,
                      deleted_by: "",
                      logo: "",
                      banner: "",
                    });
                    const user = await new userModel({
                      name: rowObjs[i].name,
                      // description: rowObjs[i].description,
                      address: rowObjs[i].address,
                      // email: rowObjs[i].email,
                      email : rowObjs[i].username_email, //change for bulk email
                      phone_number: rowObjs[i].phone_number,
                      username_email: rowObjs[i].username_email,
                      eventId: req.body.eventId,
                      role: "sponsor",
                      status: 1,
                      logo: "",
                    });
                    const emailPassword = generateRandomPassword().toString(); 
                    const hashedPassword = await hashPassword(emailPassword); 
                    console.log(`The generated credential is ${emailPassword}`);
                    var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
                    const event = await eventModel.findById(req.body.eventId);
                    // console.log(event);
                    var eventDetails;
                    if (event) {
                      eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
                    }
                    sendEmailCred(emailPassword, sponsor.username_email, 'VOE:Sponsor Credential', true, eventDetails)
                    user.password = hashedPassword; // Updating the password
                    sponsor.password = hashedPassword; // Updating the password
                    await sponsor.save();
                    await user.save();
                    Sponsor_sucessData.push(rowObjs[i]);
                  } else {
                    sponsor_duplicat.push(rowObjs[i]);
                  }
                } catch (error) {
                  console.log("Error:", error);
                }
              } else {
                invalide_Data.push(rowObjs[i]);
              }
            }
          } else {
            return "Invalid csv format please check sample csv.";
          }
        } catch (error) {
          console.log("Validate Cvs data error:", error);
        }
      }
    } catch (error) {  
      return catchError('Event.sponBulkUpload', error, req, res)
    }
  }

  async speakerHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const email = req.body.email;
        const username_email = req.body.email;
        const eventId = req.body.eventId;
        if (eventId) {
          await speakerModel.deleteOne({username_email:username_email, eventId:eventId});
          await userModel.deleteOne({email:email, eventId:eventId});
        } else {
          await speakerModel.deleteMany({username_email:username_email});
          await userModel.deleteMany({email:email});
        }
        return response(req, res, status.OK, jsonStatus.OK, 'spe_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.speakerHdBySa', error, req, res)
    }
  }

  async sponsorHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const email = req.body.email;
        const username_email = req.body.email;
        const eventId = req.body.eventId;
        if (eventId) {
          await sponsorModel.deleteOne({username_email:username_email, eventId:eventId});
          await userModel.deleteOne({email:email, eventId:eventId});
        } else {
          await sponsorModel.deleteMany({username_email:username_email});
          await userModel.deleteMany({email:email});
        }
        return response(req, res, status.OK, jsonStatus.OK, 'prtn_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.sponsorHdBySa', error, req, res)
    }
  }

  async expoHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const email = req.body.email;
        const username_email = req.body.email;
        const eventId = req.body.eventId;
        if (eventId) {
          await expoModel.deleteOne({username_email:username_email, eventId:eventId});
          await userModel.deleteOne({email:email, eventId:eventId});
        } else {
          await expoModel.deleteMany({username_email:username_email});
          await userModel.deleteMany({email:email});
        }
        return response(req, res, status.OK, jsonStatus.OK, 'expo_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.expoHdBySa', error, req, res)
    }
  }

  async sessionHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        // await stageModel.deleteOne({_id:_id});
        const session = await sessionModel.findById( {_id : req.body._id} );
        if (!session) return next(new Error('Session does not exist with above eventId'));
        const sessionDelete = await sessionModel.deleteOne( {
          eventId : session.eventId,
          title : session.title,
          description : session.description,
          starts_at : session.starts_at,
          ends_at : session.ends_at,
          sessionTime : session.sessionTime,
        } );

        const stageDelete = await stageModel.deleteOne( {
          eventId : session.eventId,
          title : session.title,
          description : session.description,
          starts_at : session.starts_at,
          ends_at : session.ends_at,
          sessionTime : session.sessionTime,
        } );

        const schedDelete = await scheduleModel.deleteOne( {
          eventId : session.eventId,
          title : session.title,
          description : session.description,
          starts_at : session.starts_at,
          ends_at : session.ends_at,
          sessionTime : session.sessionTime,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'ss_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.sessionHdBySa', error, req, res)
    }
  }

  async schedAgHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        // await stageModel.deleteOne({_id:_id});
        const schedule = await scheduleModel.findById( {_id : req.body._id} );
        if (!schedule) return next(new Error('Schedule does not exist with above eventId'));
        const schedDelete = await scheduleModel.deleteOne( {
          eventId : schedule.eventId,
          title : schedule.title,
          description : schedule.description,
          starts_at : schedule.starts_at,
          ends_at : schedule.ends_at,
          sessionTime : schedule.sessionTime,
        } );

        const sessionDelete = await sessionModel.deleteOne( {
          eventId : schedule.eventId,
          title : schedule.title,
          description : schedule.description,
          starts_at : schedule.starts_at,
          ends_at : schedule.ends_at,
          sessionTime : schedule.sessionTime,
        } );

        const stageDelete = await stageModel.deleteOne( {
          eventId : schedule.eventId,
          title : schedule.title,
          description : schedule.description,
          starts_at : schedule.starts_at,
          ends_at : schedule.ends_at,
          sessionTime : schedule.sessionTime,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'sag_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.schedAgHdBySa', error, req, res)
    }
  }

  async stageHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        // await stageModel.deleteOne({_id:_id});
        const stage = await stageModel.findById( {_id : req.body._id} );
        if (!stage) return next(new Error('Stage does not exist with above eventId'));
        const stageDelete = await stageModel.deleteOne( {
          eventId : stage.eventId,
          title : stage.title,
          description : stage.description,
          starts_at : stage.starts_at,
          ends_at : stage.ends_at,
          sessionTime : stage.sessionTime,
        } );

        const sessionDelete = await sessionModel.deleteOne( {
          eventId : stage.eventId,
          title : stage.title,
          description : stage.description,
          starts_at : stage.starts_at,
          ends_at : stage.ends_at,
          sessionTime : stage.sessionTime,
        } );

        const schedDelete = await scheduleModel.deleteOne( {
          eventId : stage.eventId,
          title : stage.title,
          description : stage.description,
          starts_at : stage.starts_at,
          ends_at : stage.ends_at,
          sessionTime : stage.sessionTime,
        });
        return response(req, res, status.OK, jsonStatus.OK, 'stg_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.stageHdBySa', error, req, res)
    }
  }

  async eventHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        let event = await eventModel.findOneAndDelete({_id:_id});
        if(!event) return next(new Error('Event does not exist.'))
        logger.warn(`Event (${event.name}) has been hard deleted by ${user.role} at`)
        return response(req, res, status.OK, jsonStatus.OK, 'eve_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.eventHdBySa', error, req, res)
    }
  }

  async eveFeedHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await stageModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'eve_f_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.eveFeedHdBySa', error, req, res)
    }
  }

  async eveFeedCmntHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await eveFeedCmntModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'eve_fc_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.eveFeedCmntHdBySa', error, req, res)
    }
  }

  async loungeHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await loungeModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'lounge_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.loungeHdBySa', error, req, res)
    }
  }

  async notificationHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await notificationModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'noti_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.notificationHdBySa', error, req, res)
    }
  }

  async organizationHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        // const org = await organizationModel.findOneAndDelete({_id:_id});
        const org = await organizationModel.findById( {_id : req.body._id} );
        if (!org) return next(new Error('Organization does not exist.'));
        const orgDelete = await organizationModel.deleteOne( {
          name : org.name,
          email : org.email,
          address : org.address,
        } );
        const orgUsDelete = await userModel.deleteOne( {
          name : org.name,
          email : org.email,
          address : org.address,
        } );
        logger.warn(`Organization (${org.name}) has been hard deleted by ${user.role} at`)
        return response(req, res, status.OK, jsonStatus.OK, 'org_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.organizationHdBySa', error, req, res)
    }
  }

  async speCollHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await speakerCollModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'spe_coll_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.speCollHdBySa', error, req, res)
    }
  }

  async spoCollHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await sponsorCollModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'spo_coll_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.spoCollHdBySa', error, req, res)
    }
  }

  async zoomHdBySa(req, res, next) {
    try {
      let role;
      let superAdmin;
      const superAdminId = req.body.superAdminId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
        const _id = req.body._id;
        await zoomModel.deleteOne({_id:_id});
        return response(req, res, status.OK, jsonStatus.OK, 'zoom_dlt', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }
    } catch (error) {  
      return catchError('Event.zoomHdBySa', error, req, res)
    }
  }

  // async commentOnPost (req, res ) {    
  //   try {  
  //     let eveFeedPost = await eventFeedModel.aggregate([{
  //       $lookup: {
  //               from: "eveFeedCmnt",
  //               localField: "_id[]",
  //               foreignField: "eventFeedPostId[]",
  //               as: "comment"
  //           }
  //   }])
  // let eveFeedComment =  await userModel.find( {}, { _id: 0, email: 1, first_name: 1, last_name: 1, logo: 1 },{ status : [ 1 ] , _id : eventFeedPost[0].userId.toString() } ).sort({_id:-1}).lean();  
  // {
  //   $project: {_id:1, eventId:1, userId:1, description:1,logo:1}
  // },
  //     return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: {eveFeedPost:eveFeedPost }})
  //   } catch (error) {
  //     return catchError('Event.commentOnPost', error, req, res)
  //   }
  // }
}

module.exports = new Event()