const bcrypt = require('bcrypt')
const moment = require('moment')
var jwt = require("jsonwebtoken")
const { catchError, pick, response, genJwtHash, randomFixedInteger, generateRandomString } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { chatModel } = require('../models/chat')
const { chatNotificationModel } = require('../models/chatNotification')
const { userModel } = require('../models/user')
const socket = require('../services/socket')

const bcryptSalt = bcrypt.genSaltSync(9)

class Chat {
  async priChat(req, res) {
    try {
      const eventId = req.body.eventId
      const userDetails = await userModel.findById( {_id: req.body.senderId },
        {email:1,name:1,first_name:1,last_name:1,logo:1})
      const userDetailsRec = await userModel.findById( {_id :req.body.receiverId},
        {email:1,name:1,first_name:1,last_name:1,logo:1})
      let userUpdDetails = []
      let userRecDetails = []

      const chatUser = await chatModel.find({_id: req.body._id})


      if (req.body.senderId) {
        for (let index = 0; index < chatUser.length; index++) {
          for (let indexi = 0; indexi < chatUser[index].senderDetails.length; indexi++) {
            userUpdDetails.push(chatUser[index].senderDetails[indexi])
          }
      }
      userUpdDetails.push(userDetails)
      } 
      if (req.body.receiverId) {
        for (let index = 0; index < chatUser.length; index++) {
          for (let indexi = 0; indexi < chatUser[index].receiverId.length; indexi++) {
            userUpdDetails.push(chatUser[index].receiverId[indexi])
          }
      }
      userUpdDetails.push(userDetailsRec)
      }
      
      if (req.body.senderId===req.body.receiverId) {
        return response(req, res, status.BadRequest, jsonStatus.BadRequest, 'y_cnt', { status: 0 })
      }
      const descr = userDetails.first_name + ' ' + userDetails.last_name  + " sent you a message.";     
      const chatNotification = await new chatNotificationModel({
        eventId : req.body.eventId,
        senderId : req.body.senderId,
        receiverId : req.body.receiverId,
        description: descr,
        first_name : userDetails.first_name,
        last_name : userDetails.last_name,
        senderLogo : userDetails.logo,
        logo : userDetails.logo,
        chatNotificationUser : req.body.chatUserDetails
      })
      
      const chat = new chatModel({
        eventId : req.body.eventId,
        senderId : req.body.senderId,
        receiverId : req.body.receiverId,
        message : req.body.message,
        senderDetails : userUpdDetails,
        receiverDetails : userRecDetails,
        chatUserDetails : req.body.chatUserDetails,
        msgUserId : req.body.senderId,
        senderLogo : userDetails.logo
      })
      const chatCou = new chatModel({
        eventId : req.body.eventId,
        senderId : req.body.senderId,
        receiverId : req.body.receiverId,
      })
      const receiverId = req.body.receiverId
      const chatNotificationCount = await chatNotificationModel.find({ eventId : eventId, receiverId: receiverId, status: 1, isRead: false, isRemove: false} );
      await chat.save()
      await chatNotification.save()
      if(chatNotificationCount.length !== 0) {
        socket.emit("privChat", chat)
        socket.emit("chatNotification", chatNotification);
        socket.emit("chatNotificationCount",[chatCou, chatNotificationCount.length])
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [chat, chatNotificationCount.length] })
      }
    } catch (error) {
        return catchError('Chat.priChat', error, req, res)
    }
  }

  async allRecSendMsg (req, res) {
    try {
      let eventId = req.body.eventId
      let chatUserArray= req.body.chatUserDetails.split(',')
      let userChat=[]


      // for (let i = 0; i < chatUserArray.length; i++) {
      if (chatUserArray) {
        let sender = await chatModel.find( { eventId: eventId,senderId:chatUserArray[0], receiverId:chatUserArray[1]},{eventId:1, message: 1,createdAt:1,msgUserId:1,receiverId:1,senderLogo:1}).sort({_id:-1})
        if (sender) {
          for (let k = 0; k < sender.length; k++) {
            userChat.push(sender[k])
            
          }
        } if (chatUserArray) {
          let receiver = await chatModel.find( { eventId: eventId,senderId:chatUserArray[1], receiverId:chatUserArray[0]},{eventId:1,message: 1,createdAt:1,msgUserId:1,receiverId:1,senderLogo:1}).sort({_id:-1})
          if(receiver){
            for (let j = 0; j < receiver.length; j++) {
              
              userChat.push(receiver[j])
            }

          }
        }
     } 
      // }

      userChat.sort(function(a, b) {
        var c = new Date(a.createdAt);
        var d = new Date(b.createdAt);
        return c-d;
       });

      socket.emit("RecProChat", userChat)
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: userChat  })
    } catch (error) {
      return catchError('Chat.allRecSendMsg', error, req, res)
    }
  }

  async chattedUser (req, res) {
    try {
      // const chat = await chatModel.find( {
      //   eventId: req.body.eventId, 
      //   chatUserDetails: req.body.chatUserDetails 
      // }, {senderDetails: 1,receiverDetails:1}).sort({_id:-1})
      // const chat = await chatModel.find( { $or:[ {'senderId':req.body.chatUserDetails}, {'receiverId':req.body.chatUserDetails}]},{senderDetails: 1,receiverDetails:1}).sort({_id:-1})
      // let senderId = req.body.senderId
      // const chat = await chatModel.find({senderId:senderId}).distinct('senderDetails')
      // socket.emit("chattedUser", chat)


      let msgUserId = req.body.msgUserId
      let userId = req.body.userId
      // let eventId = req.body.eventId

      const chat = await chatModel.findOne({msgUserId:msgUserId}).distinct('senderDetails')
      const chatUser = await userModel.findOne({_id:userId},{first_name:1,last_name:1,email:1,logo:1})

      // const chat = await chatModel.findOne({msgUserId:msgUserId, eventId:eventId}).distinct('senderDetails')

      let chatArray=[]
      let chatNewArray=[]
      for (let index = 0; index < chat.length; index++) {
        if (msgUserId == chat[index]._id) {
        } else {
          chatArray.push(chat[index])
          const chattedUser = await userModel.find({_id:chat[index]._id},{name:1,first_name:1,last_name:1,email:1,logo:1})
          for (let j = 0; j < chattedUser.length; j++) {
            chatNewArray.push(chattedUser[j])
          }
          // console.log({chatNewArray});
        }
      }

      socket.emit("chattedUser", chatNewArray)

      // const chat = await chatModel.aggregate([
      //   {
      //     $group: {
      //       _id: 0,
      //       eventId: { $addToSet: '$eventId' },
      //       senderDetails: { $addToSet: '$senderDetails' },
      //       receiverDetails: { $addToSet: '$receiverDetails' },
      //       chatUserDetails: { $addToSet: '$chatUserDetails' },

      //     },
      //   },
      // ]);
      // const chat = await chatModel.find( { $or:[ {'senderId':req.body.chatUserDetails}, {'receiverId':req.body.chatUserDetails}]},{senderDetails:1,createdAt:1,msgUserId:1}).sort({_id:-1})

      // socket.emit("chattedUser", chat)
      return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: chatNewArray })
      // return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: [chatUser] })
    } catch (error) {
      return catchError('Chat.chattedUser', error, req, res)
    }
  }

  async allChatNotification(req, res) {
    try {
        const eventId = req.body.eventId
        const receiverId = req.body.receiverId
        const chatNotifications = await chatNotificationModel.find({ eventId : eventId, receiverId: receiverId, status: 1, isRemove: false} ).sort({ createdAt: -1 });
        const chatNotificationCount = await chatNotificationModel.find({ eventId : eventId, receiverId: receiverId, isRead: false,} ).count();
        if (chatNotifications.length === 0) {
          return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: chatNotifications })
        } else if(chatNotifications.length !== 0) {
          socket.emit("chatNotificationCount",chatNotificationCount)
          return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: chatNotifications, chatNotificationCount })
        }
        // socket.emit("chatNotification", chatNotifications);
    } catch (error) {
        return catchError('Chat.allChatNotification', error, req, res)
    }
  }

  async chatNotificationDetail(req, res, next) {
    try {
        const notificationId = req.body.notificationId;
        const notification = await chatNotificationModel.findById(notificationId);
        if (!notification) return next(new Error('Notification does not exist'));
        return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: notification })
    } catch (error) {
        return catchError('Chat.chatNotificationDetail', error, req, res)
    }
  }

  async isChatNotificationRead(req, res) {
    try {
      const eventId = req.body.eventId
      const receiverId = req.body.receiverId
      const chatNotificationUser = req.body.chatNotificationUser
        const notification = await chatNotificationModel.updateMany(
          { "chatNotificationUser": chatNotificationUser },
          { "$set": { 'isRead' : true}}
        )
        // const notification = await chatNotificationModel.findByIdAndUpdate( req.body._id, {
        //   isRead: true,
        // }, {new: true });

        const chatNotificationCount = await chatNotificationModel.find({ eventId : eventId, receiverId: receiverId, isRead: false,} ).count();
        // await notification.save()
        socket.emit("chatNotificationCount",chatNotificationCount)
        return response(req, res, status.OK, jsonStatus.OK, 'ntfn_rd', { status: 1, data: chatNotificationCount })
    } catch (error) {  
    return catchError('Chat.isChatNotificationRead', error, req, res)
    }
  }

  async rmvAllChatNotification(req, res) {
      try {
          // const notification = await chatNotificationModel.updateMany({
          //     eventId : req.body.eventId,
          //     isRemove: "true",
          // });
          const notification = await chatNotificationModel.updateMany({receiverId: req.body.receiverId}, {
            $set: {
              eventId : req.body.eventId,
              isRemove: "true",
            },
        }, { new: true });
          // await notification.save()
          return response(req, res, status.OK, jsonStatus.OK, 'ntfcn_rmvd', { status: 1 })
      } catch (error) {
          return catchError('Chat.rmvAllChatNotification', error, req, res)
      }
  }

  async allDeletedChatNotification(req, res) {
      try {
          const notification = await chatNotificationModel.find({ status: [-1] }).sort({_id:-1 });
          return response(req, res, status.OK, jsonStatus.OK, 'success', { status: 1, data: notification })
      } catch (error) {
          return catchError('Chat.allDeletedChatNotification', error, req, res)
      }
  }

  async deleteChatNotification(req, res, next) {
      try {
          await chatNotificationModel.findByIdAndUpdate(req.body.notificationId, { status: -1, deleted_by: req.body.superAdminId });
          return response(req, res, status.OK, jsonStatus.OK, 'noti_dlt', { status: 1 })    
      } catch (error) {  
        return catchError('Chat.deleteChatNotification', error, req, res)
      }
  }

}

module.exports = new Chat()