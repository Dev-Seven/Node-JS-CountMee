const bcrypt = require('bcrypt')
const moment = require('moment')
var jwt = require("jsonwebtoken")
var multer = require('multer')

const { catchError, pick, response, genJwtHash, generateRandomPassword, hashPassword, sendPushNotification, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { notificationModel } = require('../models/notification')
const socket = require('../services/socket')
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

class Notification {
    async allNotification(req, res) {
        try {
            const notifications = await notificationModel.find({ status: [1, 0] } && { isRemove: "false"}).sort({ _id: -1 });
            socket.emit("notifications", notifications);
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: notifications })
        } catch (error) {
            return catchError('Notification.allNotification', error, req, res)
        }
    }

    async notificationDetail(req, res, next) {
        try {
            const notificationId = req.body.notificationId;
            const notification = await notificationModel.findById(notificationId);
            if (!notification) return next(new Error('Notification does not exist'));
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: notification })
        } catch (error) {
            return catchError('Notification.notificationDetail', error, req, res)
        }
    }

    async rmvAllNotification(req, res) {
        try {
            const notification = await notificationModel.updateMany({
                isRemove: "true",
            });
            // await notification.save()
            return response(req, res, status.OK, jsonStatus.OK, 'ntfcn_rmvd', { status: 1 })
        } catch (error) {
            return catchError('Notification.rmvAllNotification', error, req, res)
        }
    }

    async rmvNotificationToList(req, res, next) {
        try { 
          const notification = await notificationModel.findByIdAndUpdate( req.body.notificationId, {
            isRemove: "true",
          }, {new: true });
          if (!notification) return next(new Error('Notification does not exist'));
          await notification.save()
          return response(req, res, status.OK, jsonStatus.OK, 'nt_rm', { status: 0, data: notification })
        } catch (error) {  
        return catchError('Notification.rmvNotificationToList', error, req, res)
        }
      }

    async allDeletedNotification(req, res) {
        try {
            const notification = await notificationModel.find({ status: [-1] }).sort({_id:-1 });
            return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: notification })
        } catch (error) {
            return catchError('Notification.allDeletedNotification', error, req, res)
        }
    }

    async deleteNotification(req, res, next) {
        try {
            await notificationModel.findByIdAndUpdate(req.body.notificationId, { status: -1, deleted_by: req.body.superAdminId });
            return response(req, res, status.OK, jsonStatus.OK, 'noti_dlt', { status: 1 })    
        } catch (error) {  
          return catchError('Notification.deleteNotification', error, req, res)
        }
    }
}


module.exports = new Notification()