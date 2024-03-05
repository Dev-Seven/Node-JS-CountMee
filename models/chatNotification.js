const mongoose = require('mongoose');

const chatNotificationSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    senderId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    receiverId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    msgUserId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    description: {
        type: String,
    },
    chatNotificationUser : {
        type: Array
    },
    first_name : {
        type: String,
    },
    last_name : {
        type: String,
    },
    senderLogo : {
        type: String,
        data: Buffer,
        allowNull: true,
    },
    logo : {
        type: String,
        data: Buffer,
        allowNull: true,
    },
    isRemove : {
        type: Boolean,
        default: false,
    },
    isRead : {
        type: Boolean,
        default: false,
    },
    status: {
        type: Number,
        default: 1   // 0 : inActive , 1 : Active , -1 : Deleted
    },
    deleted_by: {
        type: String,
        allowNull: true,
        default: ''
    },
    },
    {
        timestamps: true
    }
);

const chatNotificationModel = mongoose.model("chatNotificationModel", chatNotificationSchema, "chatNotification");
module.exports = {
    chatNotificationModel,
};