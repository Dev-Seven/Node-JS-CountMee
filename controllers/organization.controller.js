const bcrypt = require('bcrypt')
const moment = require('moment')
var jwt = require("jsonwebtoken")
var multer = require('multer')

const { catchError, pick, response, genJwtHash, generateRandomPassword, hashPassword, sendPushNotification, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const {logger} = require("../services/logger")
const { organizationModel } = require('../models/organization')
const { userModel } = require('../models/user')
const { eventModel } = require('../models/event')
const { speakerModel } = require('../models/speaker')
const { sponsorModel } = require('../models/sponsor')
const { expoModel } = require('../models/expo')
const { sessionModel } = require('../models/session')
const bcryptSalt = bcrypt.genSaltSync(9)

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/files')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

class Organization {
    async createOrganization(req, res) {
        try {
            const organization = new organizationModel({
                superAdminId: req.body.superAdminId,
                name: req.body.name,
                email: req.body.email,
                website: req.body.website,
                address: req.body.address,
                phone_number: req.body.phone_number,
                role: 'organization'
            })
            const user = new userModel({
                superAdminId: req.body.superAdminId,
                email: req.body.email,
                name: req.body.name,
                website: req.body.website,
                address: req.body.address,
                phone_number: req.body.phone_number,
                role: 'organization'
            })
            const email = req.body.email;
            const existingUser = await organizationModel.findOne({ email });
            if (existingUser) {
                if (existingUser.email === req.body.email) {
                    return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_use')
                } 
                // else {
                //     return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
                // }
            }
            // const name = req.body.name;
            // const existingOrgName = await organizationModel.findOne({ name });
            // if (existingOrgName) {
            //     if (existingOrgName.name === req.body.name) {
            //         return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'org_nm_ext')
            //     } 
            //     // else {
            //     //     return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
            //     // }
            // }
            if (req.files) {
                let path = ''
                req.files.forEach(function(files, index, arr) {
                    path = path + files.path + ','
                })
                path = path.substring(0, path.lastIndexOf(","))
                organization.logo = path
            }
            if (req.files) {
                let path = ''
                req.files.forEach(function(files, index, arr) {
                    path = path + files.path + ','
                })
                path = path.substring(0, path.lastIndexOf(","))
                user.logo = path
            }
            if (!email || email === "" || email === null || email === undefined) return res.status(401).send({ status: false, msg: 'Please provide E-mail.' })
                // if (!name || name === "" || name === null || name === undefined) return res.status(401).send({ status: false, msg: 'Please provide Name.' })
                // let userE = await organizationModel.findOne({ email: email });  
                // if (user === null || !user || user === undefined) {
                //   return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'no_user')
                // }
                // const email = req.body.email;
            const existingEmail = await userModel.findOne({ email });
            if (existingEmail) {
                if (existingEmail.email === req.body.email) {
                    return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'Email_already_usee')
                } 
                // else {
                //     return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'error')
                // }
            }
            const emailPassword = generateRandomPassword().toString();
            const hashedPassword = await hashPassword(emailPassword);
            const password = await (emailPassword)
            console.log(`The generated credential is ${emailPassword}`);
            var body = 'Your Verification code for VOE registration is' + emailPassword + '.';
            var organizationDetails;
            if (organization) {
                organizationDetails = `<p>Organization Details <br>Name : ${organization.name}</p>`;
            }
            sendEmailCred(emailPassword, email, 'VOE:Organization Credential', true, organizationDetails)
            user.password = hashedPassword; // Updating the password
            user.plain_password = emailPassword;
            organization.password = hashedPassword; // Updating the password
            organization.plain_password = emailPassword;

            await user.save()
            await organization.save();
            // return response(req, res, status.Create, jsonStatus.Create, 'cred_send', { status: 1, data: user })
            return response(req, res, status.Create, jsonStatus.Create, 'org_cred_send', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.createOrganization', error, req, res)
        }
    }

    async editOrganization(req, res) {
        try {
            const { email } = req.body;
            const organization = await organizationModel.findOneAndUpdate({email : req.body.email}, {
                // name: req.body.name,
                // description: req.body.description,
                // email: req.body.email,
                // country_name: req.body.country_name,
                // state: req.body.state,
                // city: req.body.city,
                // website: req.body.website,
                // address: req.body.address,
                // phone_number: req.body.phone_number,
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    email: req.body.email,
                    country_name: req.body.country_name,
                    state: req.body.state,
                    city: req.body.city,
                    website: req.body.website,
                    address: req.body.address,
                    phone_number: req.body.phone_number,
                    country_name: req.body.country_name,
                },
                status: 1
            }, { new: true });
            
            // await userModel.updateOne({email: req.body.email},{$set: {name: req.body.name}});

            const user = await userModel.findOneAndUpdate({email: req.body.email}, {
                $set: {
                    name: req.body.name,
                    website: req.body.website,
                    address: req.body.address,
                    phone_number: req.body.phone_number,
                },
            }, { new: true });
            
            // user.name =  req.body.name;
            // user.update();
            //  ByIdAndUpdate(req.body.userId, {
            //     name: req.body.name,
            //     status: 1
            // }, { new: true });
            // const email = req.body.email;
            // const existingUser = await organizationModel.findOne({ email });
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
            //   organization.logo = path.split(",")
            // }
            if (typeof req.files !== 'undefined' && req.files.length > 0) {                
                organization.logo = req.files[0].path
            }
            if ( typeof req.body.logo !== 'undefined' && req.body.logo )
            {
                organization.logo = req.body.logo; 
            }

            if (typeof req.files !== 'undefined' && req.files.length > 0) {                
                user.logo = req.files[0].path
            }
            if ( typeof req.body.logo !== 'undefined' && req.body.logo )
            {
                user.logo = req.body.logo; 
            }
            organization.save()
            user.save()
            return response(req, res, status.OK, jsonStatus.OK, 'organization_updated', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.editOrganization', error, req, res)
        }
    }

    async editUserOrganization(req, res) {
        try {
            const { email } = req.body;
            const organization = await organizationModel.findOneAndUpdate({email : req.body.email}, {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    email: req.body.email,
                    country_name: req.body.country_name,
                    state: req.body.state,
                    city: req.body.city,
                    website: req.body.website,
                    address: req.body.address,
                    phone_number: req.body.phone_number,
                    country_name: req.body.country_name,
                },
                status: 1
            }, { new: true });
            
            // await userModel.updateOne({email: req.body.email},{$set: {name: req.body.name}});

            const user = await userModel.findOneAndUpdate({email: req.body.email}, {
                $set: {
                    name: req.body.name,
                    website: req.body.website,
                    address: req.body.address,
                    phone_number: req.body.phone_number,
                },
            }, { new: true });
            
            if (typeof req.files !== 'undefined' && req.files.length > 0) {                
                organization.logo = req.files[0].path
            }
            if ( typeof req.body.logo !== 'undefined' && req.body.logo )
            {
                organization.logo = req.body.logo; 
            }

            if (typeof req.files !== 'undefined' && req.files.length > 0) {                
                user.logo = req.files[0].path
            }
            if ( typeof req.body.logo !== 'undefined' && req.body.logo )
            {
                user.logo = req.body.logo; 
            }
            organization.save()
            user.save()
            return response(req, res, status.OK, jsonStatus.OK, 'organization_updated', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.editUserOrganization', error, req, res)
        }
    }

    async userOrganizationDetail(req, res, next) {
        try {
            const organizationId = req.body._id;
            const organization = await userModel.findById(organizationId);
            if (!organization) return next(new Error('Organization does not exist'));
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.userOrganizationDetail', error, req, res)
        }
    }

    async organizationDetail(req, res, next) {
        try {
            const organizationId = req.body.id;
            const organization = await organizationModel.findById(organizationId);
            if (!organization) return next(new Error('Organization does not exist'));
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.organizationDetail', error, req, res)
        }
    }

    async allOrganization(req, res) {
        try {
            const organizations = await organizationModel.find({ status: [1, 0] }).sort({ _id: -1 });
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: organizations })
        } catch (error) {
            return catchError('Organization.allOrganization', error, req, res)
        }
    }

    async allUserOrganization(req, res) {
        try {
            const userOrganizations = await userModel.find({ status: [1, 0], role: 'organization' }).sort({ _id: -1 });
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: userOrganizations })
        } catch (error) {
            return catchError('Organization.allUserOrganization', error, req, res)
        }
    }

    async activeOrganization(req, res) {
        try {
            const organization = await organizationModel.findByIdAndUpdate(req.body.organizationId, {
                superAdminId: req.body.superAdminId,
                isActive: true,
            }, { new: true });
            var topic =
                "epitome-voe-notifications-" + organization;
            var pushmessage = "Your organization has been approved successfully";
            var title = process.env.SITE_NAME;
            let data = {
                type: "organizationrequest",
            };
            sendPushNotification(pushmessage, title, topic, data);
            await organization.save()
            return response(req, res, status.OK, jsonStatus.OK, 'org_approved', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.activeOrganization', error, req, res)
        }
    }

    async declineOrganization(req, res) {
        try {
            const organization = await organizationModel.findByIdAndUpdate(req.body.organizationId, {
                superAdminId: req.body.superAdminId,
                isDeactive: true,
                isActive: false,
            }, { new: true });
            var topic =
                "epitome-voe-notifications-" + organization;
            var pushmessage = "Your event has been declined";
            var title = process.env.SITE_NAME;
            let data = {
                type: "eventrequest",
            };
            sendPushNotification(pushmessage, title, topic, data);
            await organization.save()
            return response(req, res, status.OK, jsonStatus.OK, 'org_dec', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.declineOrganization', error, req, res)
        }
    }

    async deactivateOrganization(req, res) {
        try {
            const user = await userModel.findOneAndUpdate({ email: req.body.email, role: 'organization' }, {
                superAdminId: req.body.superAdminId,
                isDeactive: true,
                isActive: false,
                status: false,
            }, { new: true });
            const userOrg = await organizationModel.findOneAndUpdate({ email: req.body.email }, {
                superAdminId: req.body.superAdminId,
                status: false,
                isDeactive: true,
                isActive: false,
            }, { new: true });
            var to000pic =
                "epitome-voe-notifications-" + user;
            var pushmessage = "Accout has been deactivated successfully";
            var title = process.env.SITE_NAME;
            let data = {
                type: "organizationDeactivateRequest",
            };
            //sendPushNotification(pushmessage, title, topic, data);
            await user.save()
            
            return response(req, res, status.OK, jsonStatus.OK, 'org_dec', { status: 1, data: [user, userOrg] })
        } catch (error) {
            console.log("error", error)
            return catchError('Organization.deactivateOrganization', error, req, res)
        }
    }

    async approveOrganization(req, res) {
        try {
            const user = await userModel.findOneAndUpdate({ email: req.body.email, role: 'organization' }, {
                superAdminId: req.body.superAdminId,
                isDeactive: false,
                isActive: true,
                status: true,
            }, { new: true });
            const userOrg = await organizationModel.findOneAndUpdate({ email: req.body.email }, {
                superAdminId: req.body.superAdminId,
                status: true,
                isDeactive: false,
                isActive: true,
            }, { new: true });
            var topic =
                "epitome-voe-notifications-" + user;
            var pushmessage = "Accout has been activated successfully";
            var title = process.env.SITE_NAME;
            let data = {
                type: "organizationDeactivateRequest",
            };
            sendPushNotification(pushmessage, title, topic, data);
            await user.save()
            return response(req, res, status.OK, jsonStatus.OK, 'org_approved', { status: 1, data: [user, userOrg] })
        } catch (error) {
            return catchError('Organization.approveOrganization', error, req, res)
        }
    }

    async orgLogo(req, res) {
        try {
            // let logo = await organizationModel.aggregate([{
            //     $lookup: {
            //             from: "user",
            //             localField: "email[]",
            //             foreignField: "email[]",
            //             as: "logo"
            //         }
            // }])
            // let logo = await userModel.find({}, { _id: 0, logo: 1 }).limit( 5 ).sort({ _id: -1 })
            let logo = await userModel.find({}).pretty();

            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: logo })
        } catch (error) {
            return catchError('Organization.orgLogo', error, req, res)
        }
    }

    async allDeletedOrganization(req, res) {
        try {
            const organization = await organizationModel.find({ status: [-1] }).sort({_id:-1 });
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: organization })
        } catch (error) {
            return catchError('Organization.allDeletedOrganization', error, req, res)
        }
    }

    async deleteOrganization(req, res, next) {
        try {
            await organizationModel.findByIdAndUpdate(req.body.id, { status: -1, deleted_by: req.body.superAdminId });
            return response(req, res, status.OK, jsonStatus.OK, 'org_dlt', { status: 1 })    
        } catch (error) {  
          return catchError('Organization.deleteOrganization', error, req, res)
        }
    }

    async organizationHdBySaWRK(req, res, next) {
        try {
            const _id = req.body._id;
            const organization = await userModel.findById(_id);
            if ( organization.isActive == true) return response(req, res, status.OK, jsonStatus.BadRequest, 'o_cnt_dlt');
            const email = req.body.email;
            await organizationModel.deleteOne({email:email});
            await userModel.deleteOne({email:email});
            return response(req, res, status.OK, jsonStatus.OK, 'org_dlt', { status: 1 })    
        } catch (error) {  
          return catchError('Organization.organizationHdBySa', error, req, res)
        }
    }

    async organizationHdBySa(req, res, next) {
        try {
            const _id = req.body._id;
            const organization = await userModel.findById(_id);
            if ( organization.isActive == true) return response(req, res, status.OK, jsonStatus.BadRequest, 'o_cnt_dlt');
            const email = req.body.email;
            // await organizationModel.deleteOne({email:email});
            // await userModel.deleteOne({email:email});
            // const event = await eventModel.deleteMany({_id:_id});
            const event = await eventModel.find({organizationId:_id});
            let orgIds = [];
            event.forEach(event => {
                orgIds.push(event._id);
            });
            const speaker = await speakerModel.find({eventId:_id});
            let speakerIds = [];
            speaker.forEach(speaker => {
              speakerIds.push(speaker._id);
            });
            const sponsor = await sponsorModel.find({eventId:_id});
            let sponsorIds = [];
            sponsor.forEach(sponsor => {
              sponsorIds.push(sponsor._id);
            });
            const expo = await expoModel.find({eventId:_id});
            let expoIds = [];
            expo.forEach(expo => {
              expoIds.push(expo._id);
            });
            const session = await sessionModel.find({eventId:_id});
            let sessionIds = [];
            session.forEach(session => {
              sessionIds.push(session._id);
            });
            const user = await userModel.find({eventId:_id});
            let userIds = [];
            user.forEach(user => {
                userIds.push(user._id);
            });
            await speakerModel.deleteMany( { eventId: { $in: orgIds } });
            await sponsorModel.deleteMany( { eventId: { $in: orgIds } });
            await expoModel.deleteMany( { eventId: { $in: orgIds } });
            await sessionModel.deleteMany( { eventId: { $in: orgIds } });
            await userModel.deleteMany( { eventId: { $in: orgIds } });
            // await speakerModel.deleteMany( { eventId: { $in: speakerIds } } && {status:1 });
            // await sponsorModel.deleteMany( { eventId: { $in: sponsorIds } } && {status:1 });
            // await expoModel.deleteMany( { eventId: { $in: expoIds } } && {status:1 });
            // await sessionModel.deleteMany( { eventId: { $in: sessionIds } } && {status:1 });
            await eventModel.deleteMany({organizationId:_id});
            await organizationModel.deleteOne({email:email});
            await userModel.deleteOne({email:email});
            logger.warn(`Organization (${organization.name}) and rest all data belongs to this organization has been hard deleted by ${req.body.superAdminId} at`)
            return response(req, res, status.OK, jsonStatus.OK, 'org_dlt', { status: 1 })    
        } catch (error) {  
          return catchError('Organization.organizationHdBySa', error, req, res)
        }
    }
}


module.exports = new Organization()