const moment = require('moment')
const { validationResult } = require('express-validator')
const { response } = require('./../services/utilities')
const { messages, jsonStatus, status } = require('../api.response')
const {
  // models: {
  //   user_device: UserDeviceModel,
  //   user: UserModel
  // }
} = require('../services/mongoose')
const { roles } = require('../services/roles')
const { userDeviceModel } = require('../models/userDevice')
const { userModel } = require('../models/user')
const usersSet = new Set()

const isUserAuthenticated = async (req, res, next) => {
  try {
    const lang = req.header('Language')
    if (lang === 'english') {
      req.userLanguage = 'english'
    } else {
      req.userLanguage = 'english'
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(status.BadRequest).jsonp({ code: jsonStatus.BadRequest, message: errors.array(), data: {} })
    if (!req.headers.authorization) return response(req, res, status.Unauthorized, jsonStatus.Unauthorized, 'auth_fail')

    const apiToken = req.headers.authorization.slice(7)
    req.user = {}

    let userData = await (`at:${apiToken}`, 'id')
    // let userData ;
    if (!userData) {
    // if (!userData[0]) {
      userData = await userDeviceModel.findOne({
        where: { auth_key: apiToken },
        attributes: [['user_id', 'id'], 'auth_key']
      })

      if (!userData) return response(req, res, status.Unauthorized, jsonStatus.Unauthorized, 'auth_fail')
      userData = userData.toJSON()

      const userCheck = await userModel.findOne({
        where: {
          id: userData.id,
          status_id: 1
        }
      })

      if (!userCheck) return response(req, res, status.Unauthorized, jsonStatus.Unauthorized, 'auth_fail')

      await hsetAsync(`at:${apiToken}`, 'id', userData.id)
      await expireAsync(`at:${apiToken}`, 3600)
      req.user = userData
      usersSet.add(req.user.id)
    } else {
      req.user.id = parseInt(userData[0])
      req.user.auth_key = apiToken
      usersSet.add(req.user.id)
    }
    next()
  } catch (error) {
    console.log(error)
    return res.send({ type: 'error', message: messages.auth_fail })
  }
}

const setLanguage = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error', { type: 'error', message: errors.array(), data: {} })

  const lang = req.header('Language')
  if (lang === 'english') {
    req.userLanguage = 'english'
  } else {
    req.userLanguage = 'english'
  }

  return next(null, null)
}

const isUserValidate = async (req, res, next) => {
  try {
    const lang = req.header('Language')
    if (lang === 'english') {
      req.userLanguage = 'english'
    } else {
      req.userLanguage = 'english'
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(status.BadRequest).jsonp({ code: jsonStatus.BadRequest, message: errors.array(), data: {} })
    next()
  } catch (error) {
    console.log(error)
    return res.send({ type: 'error', message: messages.auth_fail })
  }
}

const grantAccess = function(action, resource) {
  return async (req, res, next) => {
   try {
    const permission = roles.can(req.user.role)[action](resource);
    if (!permission.granted) {
     return res.status(401).json({
      error: "You don't have enough permission to perform this action"
     });
    }
    next()
   } catch (error) {
    next(error)
   }
  }
 }
 
 const allowIfLoggedin = async (req, res, next) => {
  try {
   const user = res.locals.loggedInUser;
   if (!user)
    return res.status(401).json({
     error: "You need to be logged in to access this route"
    });
    req.user = user;
    next();
   } catch (error) {
    next(error);
   }
 }

module.exports = {
  isUserAuthenticated,
  setLanguage,
  isUserValidate,
  grantAccess,
  allowIfLoggedin
}
