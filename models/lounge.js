const mongoose = require('mongoose');

const loungeSchema = new mongoose.Schema({
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
    organizationId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    attendeeId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    sponsorId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    speakerId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    partnerId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    type : {
        type : String,//2 4 6 8
    },
    topic : {
        type: String,
        default: ""
    },
    organizationName : {
        type: String,
    },
    eventName : {
        type: String,
    },
    logo : {
        type: String,
        data: Buffer,
        allowNull: true,
    },
    zoom_link : {
        type: String,
    },
    seats : {
        seat1:{
            type:Object,
            default:""
        },
        seat2:{
            type:Object,
            default:""
        },
        seat3:{
            type:Object,
            default:""
        },
        seat4:{
            type:Object,
            default:""
        },
        seat5:{
            type:Object,
            default:""
        },
        seat6:{
            type:Object,
            default:""
        },
        seat7:{
            type:Object,
            default:""
        },
        seat8:{
            type:Object,
            default:""
        },
    },
    lounge2 : {
        type: Number
    },
    lounge4 : {
        type: Number
    },
    lounge6 : {
        type: Number
    },
    lounge8 : {
        type: Number
    },
    isOccupLounge : {
        type:Boolean,
        default:false
    },
    // userDetails : {
    //     type: Array,
    // },
    status: {
        type: Number,
        default: 1   // 0 : inActive , 1 : Active , -1 : Deleted
    },
    deleted_by: {
        type: String,
    },
    },
    {
        timestamps: true
    }
);

const loungeModel = mongoose.model("loungeModel", loungeSchema, "lounge");
module.exports = {
    loungeModel,
};