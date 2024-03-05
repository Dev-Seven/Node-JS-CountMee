const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: String,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    session_type : { //dup4 Sched Ag
        type: String,
    },
    sessionTime : { //dup4 Sched Ag
        type: String,
    },
    schSessionSpeakers : { //dup4 Sched Ag
        type: Array,
    },
    schSessionSponsors : {  //dup4 Sched Ag
        type: Array,
    },
    sessionSpeakers : {  //dup4 Sched Ag
        type: Array,
    },
    sessionSponsors : {  //dup4 Sched Ag
        type: Array,
    },
    speakers : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    segment_backstage_link: {
        type: String,
        allowNull : true,
    },
    streamename : {
        type: String,
    },
    date : {
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

const stageModel = mongoose.model("stageModel", stageSchema, "stage");
module.exports = {
    stageModel,
};