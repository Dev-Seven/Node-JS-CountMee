const mongoose = require('mongoose');

const meetSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    superAdminId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    eventId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    // requestedUserId : { 
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    // reqAcceptUserId : { 
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    requestedUserId : { 
        type: String,
    },
    reqAcceptUserId : { 
        type: String,
    },
    meetUser : { 
        type: Array,
    },
    topic : {
        type: String,
    },
    email: {
        type: String,
    },
    meetingLimit : {
        type : String,
    },
    zoom_link : {
        type: String,
        default : '',
    },
    schedTime : {
        type: String,
    },
    seat1 : {
        type : Boolean,
        default : false
    },
    seat2 : {
        type : Boolean,
        default : false
    },
    userDetails : {
        type: Array,
    },
    requestedUser : { 
        type: Array,
    },
    reqAcceptUser : { 
        type: Array,
    },
    status: {
        type: Number,
        default: 0   // 0 : Pending , 1 : Accepted , -1 : Cancelled
    },
    deleted_by: {
        type: String,
    },
    },
    {
        timestamps: true
    }
);

const meetModel = mongoose.model("meetModel", meetSchema, "meet");
module.exports = {
    meetModel,
};