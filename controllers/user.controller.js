const bcrypt = require('bcrypt')
const moment = require('moment')
const validator = require('validator')
var jwt = require("jsonwebtoken")

const { catchError, pick, response, genJwtHash, randomFixedInteger, generateRandomString, sendEmailCred, sendEmailCredNodem, generateRandomPassword, generateRandomNumber, hashPassword, passwordSecure ,sendEmailMsg} = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { userModel } = require('../models/user')
const { eventModel } = require('../models/event')
const { speakerModel } = require('../models/speaker')
const { organizationModel } = require('../models/organization')
const { userDeviceModel } = require('../models/userDevice')
const { connectDB } = require('../services/mongoose')
const { roles } = require('../services/roles')
// const { sendEmailMsg } = require('../config');

 
const {
  // models: {
  //   user: UserModel,
  //   user_device: UserDeviceModel, 
  // }
} = require('../services/mongoose')
const bcryptSalt = bcrypt.genSaltSync(9)

class User {
  async editProfile(req, res) {
    try {
      const user = await userModel.findByIdAndUpdate( req.body._id, {
        first_name : req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        status : 1,
      }, {new: true });

      if (typeof req.files !== 'undefined' && req.files.length > 0) {                
        user.logo = req.files[0].path
      }
      if ( typeof req.body.logo !== 'undefined' && req.body.logo )
      {
          user.logo = req.body.logo; 
      }
      user.save()
      return response(req, res, status.OK, jsonStatus.OK, 'profile_updated', { status: 1, data: user })
    } catch (error) {  
    return catchError('Event.editProfile', error, req, res)
    }
  }

  async allUser (req, res) {
    try {
      const users = await userModel.find( { status : [ 1 ] } ).sort({_id:-1});
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: users })
    } catch (error) {
      return catchError('User.allUser', error, req, res)
    }
  }

  async usersCou (req, res) {
    try {
      const { pageNum, pageSize } = req.query;
      let offset = (pageNum) * pageSize;
      const users = await userModel.find().skip(pageSize*(pageNum-1)).limit(offset);
      const totalUsers = await userModel.find().count();
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: users, totalUsers })
    } catch (error) {
      return catchError('User.usersCou', error, req, res)
    }
  }

  async otpForgetPassword (req, res, next) {
    try {
      const { email } = req.body  
      if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
      if (!validator.isEmail(email)) { return res.json({ status: false, msg: 'Please provide the valid E-mail.' }) }  
      let user = await userModel.findOne({ email: email });  
      if (user === null || !user || user === undefined) {
        return res.status(404).json({ status: false, msg: `No User exist` });
      }  
      const emailOTP = generateRandomNumber().toString(); 
      const hashedOtp = await hashPassword(emailOTP); 
      console.log(`The OTP generated is ${emailOTP}`);
      // sendEmail(emailOTP, email, true);
      var body = 'Your Verification code for VOE registration is' + emailOTP + '.';
    //   sendEmail(random_number, email, true)
      sendEmailMsg(emailOTP, email, 'VOE:Signup', true)
      user.otpForgetPassword = hashedOtp; // Updating the password
      await user.save(); 
      res.status(200).json({ status: true, msg: 'OTP is send to registered E-mail.' })  
    } catch (error) {  
      return catchError('User.otpForgetPassword', error, req, res)
    } 
  }
  
  async changePassword (req, res, next)  { 
    try {
      let { email, newPassword } = req.body;  
      if (!email || email === "" || email === null || email === undefined) return res.json({ status: false, msg: 'Please provide E-mail.' })
      if (!validator.isEmail(email)) { return res.json({ status: false, msg: 'Please provide the valid E-mail.' }) }  
      let user = await userModel.findOne({ email: req.body.email });
      if (user === null || user === undefined || !user) return res.json({ status: false, msg: `User doesn't exist.` })
  
      //OTP validation
      // if (!otp || otp === "" || otp === null || otp === undefined) return res.json({ status: false, msg: 'Please provide OTP.' })
      // const isMatch = await bcrypt.compare(otp.toString(), user.otpForgetPassword); //Matching the OTP with the saved one in the database.
      // if (!isMatch) return res.json({ status: false, msg: `OTP doesn't match. Please enter the correct OTP.` });  
      if (newPassword === undefined || !newPassword || newPassword === "" || newPassword === null) return res.json({ status: false, msg: 'Please provide new password' })
      if (passwordSecure(newPassword).status === false) return res.send(passwordSecure(newPassword))
      user.password = await hashPassword(newPassword)
      await user.save();  
      return res.status(200).json({ status: true, msg: 'Password Changed Successfully.' })  
    } catch (e) {
      console.log(`Error occured is ${e}`);
      return res.status(500).json({ status: false, msg: 'Please check the OTP or Email entered. Either value is incorrect', });
    }
  }

  async userDetail (req, res , next)  {
    try {
      const userId = req.body.id;
      const user = await userModel.findById(userId);
      if (!user) return next(new Error('User does not exist'));
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {  
      return catchError('User.userDetail', error, req, res)
    }
  }

  async resetPassword (req, res, next)  { 
    try {
      let { eventId, email } = req.body;  
      let EmailArry = []
      EmailArry.push(req.body.email)

      let isExistOrganization = await organizationModel.findOne({ email: req.body.email });
      let user = await userModel.findOne({ email: {$in : EmailArry} , role : req.body.role});

      if (user === null || user === undefined || !user) return response(req, res, status.OK, jsonStatus.BadRequest, 'nuser_ext');
      const speaker = new speakerModel({
        eventId : req.body.eventId,
      })
      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The reset credential is ${emailPassword}`);
      var body = 'Your reset credentials VOE is' + emailPassword + '.';
      const event = await eventModel.findById(req.body.eventId);
      var eventDetails = null;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      const org = await organizationModel.findById(req.body.organizationId);
      var orgDetails = [];
      if (org) {
        orgDetails = `<p>Organization Details <br>Name : ${org.name} </p>`;
      }
      sendEmailCred(emailPassword, email, 'VOE:Reset Password Credential', true, eventDetails, orgDetails)
      // user.password = hashedPassword;

      if(isExistOrganization || user.role == 'organization'){
      
        // HERE IS UPDATE ORGANIZATION

        let UpdatedOrg = {
          password : hashedPassword,
          plain_password :  emailPassword
        }

        let updateOrg = await organizationModel.findByIdAndUpdate(
          isExistOrganization._id,
          UpdatedOrg,
          { new: true }
        );

        await updateOrg.save();

        // HERE IS UPDATE USER WHICH ROLE IS ORGANIZATION

      if(user.role == "organization"){

            let updatedUser = {
              password : hashedPassword,
              plain_password : emailPassword
            }
      
            let updateUser =  await userModel.findByIdAndUpdate(
              user._id,
              updatedUser,
              { new: true }
            );
      
          await updateUser.save();  

      }

      }

      if(user.role == 'user'){

        let updatedUser = {
          password : hashedPassword
        }
  
        let updateUser =  await userModel.findByIdAndUpdate(
          user._id,
          updatedUser,
          { new: true }
        );

      await updateUser.save();  

      }

      return response(req, res, status.OK, jsonStatus.OK, 'pwd_chg', { status: 1})
    } catch (error) {  
      console.log("Gettinf error while reset password :", error)
      return catchError('User.resetPassword', error, req, res)
    }
  }
  async resetPasswordOLD (req, res, next)  { 
    try {
      let { eventId, email } = req.body;  
      let user = await userModel.findOne({ email: req.body.email });
      let organization = await organizationModel.findOne({
        email : req.body.email
      });
      if (user === null || user === undefined || !user) return response(req, res, status.OK, jsonStatus.BadRequest, 'nuser_ext');
      const speaker = new speakerModel({
        eventId : req.body.eventId,
      })
      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The reset credential is ${emailPassword}`);
      var body = 'Your reset credentials VOE is' + emailPassword + '.';
      const event = await eventModel.findById(req.body.eventId);
      var eventDetails = null;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      const org = await organizationModel.findById(req.body.organizationId);
      var orgDetails = [];
      if (org) {
        orgDetails = `<p>Organization Details <br>Name : ${org.name} </p>`;
      }
      sendEmailCred(emailPassword, email, 'VOE:Reset Password Credential', true, eventDetails, orgDetails)
      user.password = hashedPassword;
      if(user.role == 'organization'){
        organization.password = hashedPassword;
        organization.plain_password = emailPassword;
        await organization.save();
      }
      await user.save();  
      return response(req, res, status.OK, jsonStatus.OK, 'pwd_chg', { status: 1})
    } catch (error) {  
      return catchError('User.resetPassword', error, req, res)
    }
  }

  async resetPwdUser (req, res, next)  { 
    try {
      let { eventId, email } = req.body;  
      let user = await userModel.findOne({ email: req.body.email });
      if (user === null || user === undefined || !user) return response(req, res, status.OK, jsonStatus.BadRequest, 'nuser_ext');
      const emailPassword = generateRandomPassword().toString(); 
      const hashedPassword = await hashPassword(emailPassword); 
      console.log(`The reset credential is ${emailPassword}`);
      var body = 'Your reset credentials VOE is' + emailPassword + '.';
      const event = await eventModel.findById(req.body.eventId);
      var eventDetails = null;
      if (event) {
        eventDetails = `<p>Event Details <br>Name : ${event.name} <br>description : ${event.description} <br>Starts at : ${event.starts_at} <br>Ends at : ${event.ends_at} </p>`;
      }
      sendEmailCred(emailPassword, email, 'VOE:Reset Password Credential', true, eventDetails)
      user.password = hashedPassword;
      if(user.role == 'user'){
        user.password = hashedPassword;
        await user.save();
      }
      await user.save();  
      return response(req, res, status.OK, jsonStatus.OK, 'pwd_chg', { status: 1})
    } catch (error) {  
      return catchError('User.resetPwdUser', error, req, res)
    }
  }

  async allDeletedUser (req, res) {
    try {
      const user = await userModel.find( { status : [ -1 ] } );
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: user })
    } catch (error) {
      return catchError('User.allDeletedUser', error, req, res)
    }
  }

  async deleteUser (req, res, next) {
    try {
      await userModel.findByIdAndDelete(req.body.id, { status: -1 , deleted_by : req.body.superAdminId });
      res.status(200).json('User has been deleted successfully.');
    } catch (error) {
      res.status(500).json(error)
    }
  }
}

module.exports = new User()
