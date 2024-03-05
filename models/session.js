const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    participant : {
        type: String,
        default: ''
        // minLength: 1,
        // maxLength: 100,
    },
    // starts_at : {
    //     type: String,
    // },
    // ends_at : { 
    //     type: String,
    // },
    startTime : {
        type: String,
    },
    endTime : {
        type: String,
    },
    date : {
        type: String,
    },
    starts_at : {  //scheduled && stage
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
    sessionTime : {
        type: String,
    },
    sessionSpeakers : {
        type: Array,
    },
    sessionSponsors : {
        type: Array,
    },
    schSessionSpeakers : {
        type: Array,
    },
    schSessionSponsors : {
        type: Array,
    },
    urlType : {
        type: String,
        enum : [ 'Zoom', 'Broadcast'],
    },
    url : { 
        type: String,
        default: ''
    },
    doc : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    speakers : {   //scheduled && stage
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    scheduledSpeakers : { //scheduled && stage
        type: Array,
    },
    schedSpeakers : {  //scheduled && stage
        type: Array,
    },
    scheduledSponsors : { //scheduled && stage
    type: Array,
    },
    schedSponsors : {  //scheduled && stage
        type: Array,
    },
    segment_backstage_link: {  //stage
        type: String,
        allowNull : true,
    },
    streamename : {   //stage
        type: String,
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

const sessionModel = mongoose.model("sessionModel", sessionSchema, "session");
module.exports = {
    sessionModel,
};