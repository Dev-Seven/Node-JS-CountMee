const bcrypt = require('bcrypt')
const moment = require('moment')
var jwt = require("jsonwebtoken")

const { catchError, pick, response, genJwtHash, sendPushNotification, randomFixedInteger, generateRandomString } = require('../services/utilities')
const {  sendOtp } = require('./common.controller')
const { status, jsonStatus, multiVersions } = require('./../api.response')
const { userModel } = require('../models/user');
const { userDeviceModel } = require('../models/userDevice');
const { connectDB } = require('../services/mongoose')
const { roles } = require('../services/roles')
 
const {
  // models: {
  //   user: UserModel,
  //   user_device: UserDeviceModel, 
  // }
} = require('../services/mongoose')
const bcryptSalt = bcrypt.genSaltSync(9)

class Auth {
  async saveUserDeviceToken(user_id, body) {
    return new Promise((resolve, reject) => {
      userDeviceModel.findOne({ where: { device_unique_id: body.device_unique_id } }).then((userDevice) => {
        if (!userDevice) {
          userDevice = userDeviceModel.build()
          userDevice.auth_key = genJwtHash({ user_id })
        }

        userDevice.user_id = user_id
        userDevice.device_unique_id = body.device_unique_id
        userDevice.push_token = body.push_token
        userDevice.login_type = body.login_type ? body.login_type : 'N'
        userDevice
          .save()
          .then(data => {
              delAsync(`at:${userDevice.auth_key}`)
              .then(() => {
                resolve(data)
              })
              .catch(reject)
          })
          .catch(error => {
            if (error.message === 'Query was empty') {
              resolve(userDevice)
            } else {
              reject(error)
            }
          })
      }).catch(reject)
    })
  }

  async userSignup(req, res) {
      try {
        const { first_name, last_name, email, password, role } = req.body;
        if (!(email && password && first_name && last_name )) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'all_req');
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
        if (existingUser.email === req.body.email) {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
          } else {
            return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'username_exists')
          }
        }
        let encryptedPassword;
        encryptedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
          first_name,
          last_name,
          email: email.toLowerCase(),
          password: encryptedPassword,
          role: role || "user",
        });
        const auth_key = jwt.sign(
          { user_id: user._id, email },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );
        user.auth_key = auth_key;
        return response(req, res, status.Create, jsonStatus.Create, 'signup_success', { status: 1, data: user })
      } catch (error) {  
    return catchError('Auth.userSignup', error, req, res)
    }
  }

  async userLogin(req, res) {
      try {
        const { email, password , eventId} = req.body;
        if (!(email && password)) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'all_req');
        }
        const noExistEmail = await userModel.findOne({ email });
        if (!noExistEmail) return response(req, res, status.OK, jsonStatus.BadRequest, 'nuser_ext');
        const user = await userModel.findOne({ email, eventId });
        if (!user.status) {
          return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'accout_dec');
        }

        const chatUser = await userModel.findOneAndUpdate( {eventId:user.eventId,
          email:user.email, 
          isChatUser: false
        },
          {
          $set:{
            eventId : req.body.eventId,
            isChatUser : true,
          }},{new: true});

        const userLog = await userModel.findOne({ email, eventId });
        if (user && (await bcrypt.compare(password, user.password))) {
          const auth_key = jwt.sign(
            { user_id: user._id, email },
            process.env.JWT_SECRET,
            {
              expiresIn: "2h",
            }
          );
          user.auth_key = auth_key;
          userLog.auth_key = auth_key;
          // return response(req, res, status.OK, jsonStatus.OK, 'signin_success', { status: 1, data: {user, role: user.role} })
          return response(req, res, status.OK, jsonStatus.OK, 'signin_success', { status: 1, data: userLog })
        }
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'invalid_cred');
      } catch (error) {  
    return catchError('Auth.userLogin', error, req, res)
    }
  }

  async userLoginSww(req, res) {
    try {
      const { email, password , eventId} = req.body;
      if (!(email && password)) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'all_req');
      }
      const noExistEmail = await userModel.findOne({ email });
      if (!noExistEmail) return response(req, res, status.OK, jsonStatus.BadRequest, 'nuser_ext');
      const user = await userModel.findOne({ email });
      if (user.status==false) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'accout_dec');
      }

      const chatUser = await userModel.findOneAndUpdate( {eventId:user.eventId,
        email:user.email, 
        isChatUser: false
      },
        {
        $set:{
          eventId : req.body.eventId,
          isChatUser : true,
        }},{new: true});

      const userLog = await userModel.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        const auth_key = jwt.sign(
          { user_id: user._id, email },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );
        user.auth_key = auth_key;
        userLog.auth_key = auth_key;
        // return response(req, res, status.OK, jsonStatus.OK, 'signin_success', { status: 1, data: {user, role: user.role} })
        return response(req, res, status.OK, jsonStatus.OK, 'signin_success', { status: 1, data: userLog })
      }
      return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'invalid_cred');
    } catch (error) {  
      return catchError('Auth.userLogin', error, req, res)
    }
  }

  async userLogout(req, res) {
    try {
     const user=  await userModel.findByIdAndUpdate({ _id: req.body._id, auth_key: req.user.auth_key,  })
      const chatUser = await userModel.findOneAndUpdate( {
        email:user.email, 
        isChatUser: user.isChatUser
      },
        {
        $set:{
          _id : req.body.userId,
          isChatUser : false,
        }},{new: true});
      return response(req, res, status.OK, jsonStatus.OK, 'logout_success',{ status: 1 })
    } catch (error) {
      return catchError('Auth.userLogout', error, req, res)
    }
  }

  async getUsers (req, res) {
    try {
      const users = await userModel.find({});
      res.status(200).json({
       data: users
      });
    } catch (error) {
      return catchError('Auth.getUsers', error, req, res)
    }
  }

  async getUser (req, res , next)  {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    if (!user) return next(new Error('User does not exist'));
    res.status(200).json({
    data: user
    });
  } catch (error) {  
    return catchError('Auth.getUser', error, req, res)
    }
  }

  async updateUser (req, res) {
  try {
    const update = req.body
    const userId = req.params.userId;
    await userModel.findByIdAndUpdate(userId, update);
    const user = await userModel.findById(userId)
    res.status(200).json({
    data: user,
    message: 'User has been updated'
    });
  } catch (error) {  
    return catchError('Auth.updateUser', error, req, res)
    }
  }
  
  async deleteUser (req, res) {
  try {
    const userId = req.params.userId;
    await userModel.findByIdAndDelete(userId);
    res.status(200).json({
    data: null,
    message: 'User has been deleted'
    });
  } catch (error) {  
    return catchError('Auth.deleteUser', error, req, res)
    }
  }
}

module.exports = new Auth()
