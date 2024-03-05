const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
    email : {
        type: String,
    },
    message: {
        type: String,
    },
    // userDetails : {
    //     type : Array,
    // },
    senderDetails : {
        type : Array,
    },
    receiverDetails : {
        type : Array,
    },
    chatUserDetails : {
        type : Array,
    },
    senderLogo : {
        type: String,
        data: Buffer,
        allowNull: true,
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

const chatModel = mongoose.model("chatModel", chatSchema, "chat");
module.exports = {
    chatModel,
};