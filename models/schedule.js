const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: String,
        required: true,
        allowNull: false
    },
    session_type : {
        type: String,
        default: 'Stage',
        enum : [ 'Stage', 'Session', 'Expo', 'Network']
    },
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
    },
    starts_at : {
        type: String,
    },
    ends_at : { 
        type: String,
    },
    starts_mm : {
        type: String,
    },
    ends_mm : { 
        type: String,
    },
    startDateTime : {
        type: String,
    },
    endDateTime : {
        type: String,
    },
    urlType : {
        type: String,
        enum : [ 'Zoom', 'Broadcast'],
    },
    url : { 
        type: String,
        default: ''
    },
    sessionTime : {
        type: String,
    },
    date : {
        type: String,
    },
    participant : {
        type: String,
        default: ''
        // minLength: 1,
        // maxLength: 100,
    },
    doc : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    speakers : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    scheduledSpeakers : {
        type: Array,
    },
    schedSpeakers : {
        type: Array,
    },
    scheduledSponsors : { //scheduled && stage
    type: Array,
    },
    schedSponsors : {  //scheduled && stage
        type: Array,
    },
    schSessionSpeakers : {
        type: Array,
    },
    status: {
        type: Number,
        default: 1   // 0 : inActive , 1 : Active , -1 : Deleted
    },
    // scheduleSpeakerName: {
    //     // type: Array,
    // },
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

const scheduleModel = mongoose.model("scheduleModel", scheduleSchema, "schedule");
module.exports = {
    scheduleModel,
};