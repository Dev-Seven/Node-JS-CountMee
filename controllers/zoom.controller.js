const bcrypt = require('bcrypt')
const moment = require('moment')
var jwt = require("jsonwebtoken")
const rp = require('request-promise')
const axios = require('axios')
// const sendResponse = new SendResponse()
// const validUrl = require('valid-url')
// const shortid = require('shortid')
const { catchError, pick, response, genJwtHash, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { userModel } = require('../models/user')
const { zoomModel } = require('../models/zoom')
const { loungeModel } = require('../models/lounge')
const bcryptSalt = bcrypt.genSaltSync(9)
var email, userid, resp;
const payload = {
  iss: process.env.APIKEYZOOM,
  exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, process.env.APISECRETZOOM)
var Url = require('url').Url;

const baseUrl = 'http:localhost:4001/api/v1/'

function addToken(req, res, next) {
  req.body["token"] = token;
  next();
}

class Zoom {
  async storeKeysforMeet(req, res) {
    try {
      const lounge = new loungeModel({
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

  async linkGenForMeet(req, res) {
    try {
        email = req.body.email;
        var options = {
          uri: "https://api.zoom.us/v2/users/"+email,
          qs: {
              status: 'active' 
          },
          auth: {
              'bearer': token
          },
          headers: {
              'User-Agent': 'Zoom-api-Jwt-Request',
              'content-type': 'application/json'
          },
          json: true
      };
      rp(options)
          .then(function (response) {
            // console.log('User has', response);
              const zoom = new zoomModel({
                first_name : response.first_name,
                last_name : response.last_name,
                email : response.email,
                type : response.type,
                role_name : response.role_name,
                pmi : response.pmi,
                use_pmi : response.use_pmi,
                personal_meeting_url : response.personal_meeting_url,
                timezone : response.timezone,
                verified : response.verified,
                dept : response.dept,
                last_login_time : response.last_login_time,
                host_key : response.host_key,
                cms_user_id : response.cms_user_id,
                jid : response.jid,
                group_ids : response.group_ids,
                im_group_ids : response.im_group_ids,
                account_id : response.account_id,
                language : response.language,
                phone_country : response.phone_country,
                phone_number : response.phone_number,
                status : response.status,
                job_title : response.job_title,
                location : response.location,
                login_types : response.login_types,
                role_id : response.role_id,
                account_number : response.account_number,
                cluster : response.cluster,
                status : 0 
              })
              zoom.save()
              resp = response
              var title1 ='<center><h3>Your token: </h3></center>' 
              var result1 = title1 + '<code><pre style="background-color:#aef8f9;">' + token + '</pre></code>';
              var title ='<center><h3>User\'s information:</h3></center>' 
              var result = title + '<code><pre style="background-color:#aef8f9;">'+JSON.stringify(resp, null, 2)+ '</pre></code>'
              res.send(result1 + '<br>' + result);
          })
          .catch(function (err) {
              console.log('API call failed, reason ', err);
          });
    } catch (error) {  
      return catchError('Zoom.linkGenForMeet', error, req, res)
    }
  }

  async allStoredKey (req, res) {
    try {
      const lounges = await loungeModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounges })
    } catch (error) {
      return catchError('Zoom.allStoredKey', error, req, res)
    }
  }

  async linkGenForLounge(req, res) {
    try {
        email = req.body.email;
        var options = {
          uri: "https://api.zoom.us/v2/users/"+email,
          qs: {
              status: 'active' 
          },
          auth: {
              'bearer': token
          },
          headers: {
              'User-Agent': 'Zoom-api-Jwt-Request',
              'content-type': 'application/json'
          },
          json: true
      };
      rp(options)
          .then(function (response) {
              console.log('User has', response);
              resp = response
              var title1 ='<center><h3>Your token: </h3></center>' 
              var result1 = title1 + '<code><pre style="background-color:#aef8f9;">' + token + '</pre></code>';
              var title ='<center><h3>User\'s information:</h3></center>' 
              var result = title + '<code><pre style="background-color:#aef8f9;">'+JSON.stringify(resp, null, 2)+ '</pre></code>'
              res.send(result1 + '<br>' + result);
          })
          .catch(function (err) {
              console.log('API call failed, reason ', err);
          });
    } catch (error) {  
      return catchError('Zoom.linkGenForLounge', error, req, res)
    }
  }

  async linkExpireForMeet(req, res) {
    try {
        email = req.body.email;
        var options = {
          uri: "https://api.zoom.us/v2/users/"+email,
          qs: {
              status: 'expired' 
          },
          auth: {
              'bearer': token
          },
          headers: {
              'User-Agent': 'Zoom-api-Jwt-Request',
              'content-type': 'application/json'
          },
          json: true
      };
      rp(options)
          .then(function (response) {
              resp = response
              var title1 ='<center><h3>Your token: </h3></center>' 
              var result1 = title1 + '<code><pre style="background-color:#aef8f9;">' + token + '</pre></code>';
              var title ='<center><h3>User\'s information:</h3></center>' 
              var result = title + '<code><pre style="background-color:#aef8f9;">'+JSON.stringify(resp, null, 2)+ '</pre></code>'
              res.send(result1 + '<br>' + result);
          })
          .catch(function (err) {
              console.log('API call failed, reason ', err);
          });
    } catch (error) {  
      return catchError('Zoom.linkExpireForMeet', error, req, res)
    }
  }

  async allActiveLinkForLounge (req, res) {
    try {
      const lounge = await loungeModel.find( { status : [ 1 ] } );
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: lounge })
    } catch (error) {
      return catchError('Zoom.allActiveLinkForLounge', error, req, res)
    }
  }

  async allActiveLinkForMeet (req, res) {
    try {
      const meet = await loungeModel.find( { status : [ 1 ] } );
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: meet })
    } catch (error) {
      return catchError('Zoom.allActiveLinkForMeet', error, req, res)
    }
  }

  async linkShorten (req, res) {
    const {
        longUrl
    } = req.body
      if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json('Invalid base URL')
    }
    const urlCode = shortid.generate()
    if (validUrl.isUri(longUrl)) {
        try {
            let url = await zoomModel.findOne({
                longUrl
            })
            if (url) {
                res.json(url)
            } else {
                const shortUrl = baseUrl + '/' + urlCode
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                })
                await url.save(function(){})
                res.json(url)
            }
      } catch (error) {
        return catchError('Zoom.linkShorten', error, req, res)
      }
    }
  }

  async addZoomUrl(req, res) {
    try {
      const zoom = new zoomModel({
        longUrl : req.body.longUrl,
      })
      await zoom.save()
      return response(req, res, status.Create, jsonStatus.Create, 'lnk_add', { status: 1, data: zoom.longUrl })
    } catch (error) {  
    return catchError('Event.addZoomUrl', error, req, res)
    }
  }

  async zoomUserInfo(req, res, next) {
    try {
      const token = req.body.token;
      const email = req.body.email;
      // const email = 'nikhil@sevensquaretech.com';
      const result = await axios.get("https://api.zoom.us/v2/users/" + email, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      // sendResponse.setSuccess(200, 'Success', result.data);
      // return sendResponse.send(res);
      return response(req, res, status.Create, jsonStatus.Create, 'Success', { status: 1, data: result.data })
    } catch (error) {
      // console.log(error.message);
      // next();
      return catchError('Event.zoomUserInfo', error, req, res)
    }
  }

  async createZoomMeeting(req, res, next) {
    try {
      const token = req.body.token;
      const email = req.body.email;
      const result = await axios.post("https://api.zoom.us/v2/users/" + email + "/meetings", {
        topic: req.body.topic,
        type: req.body.type, //"type": 3 recurring
        password: req.body.password,
        agenda: req.body.agenda,
        duration: 30,
        settings: {
          join_before_host: true,
        }
      }, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      const zoom = new zoomModel({
        uuid : result.data.uuid,
        id : result.data.id,
        host_id : result.data.host_id,
        host_email : result.data.host_email,
        topic : result.data.topic,
        status : result.data.status,
        start_time : result.data.start_time,
        duration : result.data.duration,
        timezone : result.data.timezone,
        agenda : result.data.agenda,
        start_url : result.data.start_url,
        join_url : result.data.join_url,
        password : result.data.password,
        h323_password : result.data.h323_password,
        pstn_password : result.data.pstn_password,
        encrypted_password : result.data.encrypted_password,
        type : result.data.type,
        token : result.data.token,
        email : result.data.email,
        settings : result.data.settings,
      })
      await zoom.save()
      // sendResponse.setSuccess(200, 'Success', result.data);
      // return sendResponse.send(res);
      return response(req, res, status.Create, jsonStatus.Create, 'z_m_cr', { status: 1, data: result.data })
    } catch (error) {
      return catchError('Event.createZoomMeeting', error, req, res)
    }
  }

  async updateZoomMeeting(req, res, next) {
    try {
      const token = req.body.token;
      const meetingId = req.body.meetingId;
      const result = await axios.patch("https://api.zoom.us/v2/meetings/" + meetingId, {
        // "topic": "UPDATE: Discussion about today's Demo",
        topic: req.body.topic,
        type: req.body.type, //"type": 2 def
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
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      // const zoom = new zoomModel({
      //   uuid : result.data.uuid,
      //   id : result.data.id,
      //   host_id : result.data.host_id,
      //   host_email : result.data.host_email,
      //   topic : result.data.topic,
      //   status : result.data.status,
      //   start_time : result.data.start_time,
      //   duration : result.data.duration,
      //   timezone : result.data.timezone,
      //   agenda : result.data.agenda,
      //   start_url : result.data.start_url,
      //   join_url : result.data.join_url,
      //   password : result.data.password,
      //   h323_password : result.data.h323_password,
      //   pstn_password : result.data.pstn_password,
      //   encrypted_password : result.data.encrypted_password,
      //   type : result.data.type,
      //   token : result.data.token,
      //   email : result.data.email,
      //   settings : result.data.settings,
      // })
      const zoom = await zoomModel.findOneAndUpdate({id : req.body.meetingId}, {
          $set: {
              topic: req.body.topic,
              start_time: req.body.start_time,
              duration: req.body.duration,
              timezone: req.body.timezone,
              password: req.body.password,
              agenda: req.body.agenda,
          },
          status: 1
      }, { new: true });
      zoom.save()
      return response(req, res, status.Create, jsonStatus.Create, 'z_mt_upt', { status: 1, data:zoom })
    } catch (error) {
      return catchError('Event.updateZoomMeeting', error, req, res)
    }
  }

  async meetingDetails(req, res, next) {
    try {
      const token = req.body.token;
      const meetingId = req.body.meetingId;
      const result = await axios.get("https://api.zoom.us/v2/meetings/" + meetingId, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
      return response(req, res, status.Create, jsonStatus.Create, 'Success', { status: 1, data: result.data })
    } catch (error) {
      return catchError('Event.meetingDetails', error, req, res)
    }
  }

  async allZoomMeetLink (req, res) {
    try {
      const zoom = await zoomModel.find( {}, {id:1,start_url:1,join_url:1,topic:1,start_time:1,duration:1,timezone:1,agenda:1,}).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: zoom })
    } catch (error) {
      return catchError('Zoom.allZoomMeetLink', error, req, res)
    }
  }

  async allZoomMeetLinkForLounge (req, res) {
    try {
      const zoom = await zoomModel.find( {type:2}, {id:1,start_url:1,join_url:1,topic:1,start_time:1,duration:1,timezone:1,agenda:1,}).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: zoom })
    } catch (error) {
      return catchError('Zoom.allZoomMeetLinkForLounge', error, req, res)
    }
  }

  async allZoomMeetLinkForSchedule (req, res) {
    try {
      const zoom = await zoomModel.find( {type:1}, {id:1,start_url:1,join_url:1,topic:1,start_time:1,duration:1,timezone:1,agenda:1,}).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: zoom })
    } catch (error) {
      return catchError('Zoom.allZoomMeetLinkForSchedule', error, req, res)
    }
  }

  async deleteZoomMeeting(req, res, next) {
    try {
      const superAdminId = req.body.superAdminId;
      const token = req.body.token;
      const meetingId = req.body.meetingId;
      const user = await userModel.findById({ _id:superAdminId });
      if (user.role === "superAdmin") {
      await zoomModel.deleteOne({id:meetingId});
      const result = await axios.delete("https://api.zoom.us/v2/meetings/" + meetingId, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      });
        return response(req, res, status.OK, jsonStatus.OK, 'z_m_d', { status: 1 }) 
      } else {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'perm_dnd', { status: 1 })
      }      
    } catch (error) {
      return catchError('Event.deleteZoomMeeting', error, req, res)
    }
  }

  async zoomMeetLeaveForLounge(req, res, next) {
    try {
      const body = req.body

    if (!body || body === null) {
        const message = 'There must be an error'
        Logger.error(message)
        return res.status(400).send(message);
    }

    const name = body.event
    const accountId = body.payload.account_id
    const meetingId = body.payload.object.id

    // construct the message string
    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`

    const hashForVerify = crypto.createHmac('sha256', process.env.APISECRETZOOM).update(message).digest('hex')

    // hash the message string with your Webhook Secret Token and prepend the version semantic
    const signature = `v0=${hashForVerify}`

    if(req.headers['x-zm-signature'] !== signature) {
        const message = 'Unauthorized request: webook x-zm-signature header did not match the generated signature'
        Logger.error(message)
        return res.status(401).send(message)        
    }
    return postEvents(name, accountId, meetingId, res)   
    } catch (error) {
      return catchError('Event.deleteZoomMeeting', error, req, res)
    }
  }
}

module.exports = { addToken }
module.exports = new Zoom()