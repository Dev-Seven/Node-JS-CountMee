const mongoose = require('mongoose');
// const moment = require("moment");

// var createdAt = function(){
//     var d = new Date();
//     var formattedDate = moment(d).format("DD-MM-YYYY, h:mm:ss a");
//     return formattedDate;
// };

// var updatedAt = function(){
//     var d = new Date();
//     var formattedDate = moment(d).format("DD-MM-YYYY, h:mm:ss a");
//     return formattedDate;
// };

const zoomSchema = new mongoose.Schema({
    urlCode: {
        type: String,
    },
    longUrl : {
        type: String,
    },
    shortUrl: {
        type: String,
    },
    uuid : {
        type: String,
    },
    id : {
        type: Number,
    },
    host_id : {
        type: String,
    },
    host_email : {
        type: String,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
    },
    token : {
        type: String,
    },
    topic : {
        type: String,
    },
    type: {
        type: Number,
    },
    start_time : {
        type: String,
    },
    duration : {
        type: Number,
    },
    start_url : {
        type: String,
    },
    join_url : {
        type: String,
    },
    role_name: {
        type: String,
    },
    pmi: {
        type: Number,
    },
    use_pmi: {
        type: Boolean,
    },
    personal_meeting_url: {
        type: String,
    },
    timezone: {
        type: String,
    },
    password : {
        type: String,
    },
    h323_password : {
        type: String,
    },
    pstn_password : {
        type: String,
    },
    encrypted_password : {
        type: String,
    },
    agenda : {
        type: String,
    },
    settings : {
        type: Array,
    },
    verified: {
        type: Number,
    },
    dept: {
        type: String,
    },
    last_login_time: {
        type: String,
    },
    host_key: {
        type: String,
    },
    cms_user_id: {
        type: String,
    },
    jid: {
        type: String,
    },
    group_ids: {
        type: Array,
    },
    im_group_ids: {
        type: Array,
    },
    account_id: {
        type: String,
    },
    language : {
        type: String,
    },
    phone_country : {
        type: String,
    },
    phone_number : {
        type: String,
    },
    status : {
        type: String,
    },
    job_title : {
        type: String,
    },
    location : {
        type: String,
    },
    login_types : {
        type: Array,
    },
    role_id : {
        type: String,
    },
    account_number : {
        type: Number,
    },
    cluster : {
        type: String,
    },
    deleted_by: {
        type: String,
        allowNull: true,
    },
    // createdAt: {
    //     type: String,
    //     default: createdAt
    // },
    // updatedAt: {
    //     type: String,
    //     default: updatedAt
    // },
    },
    {
        timestamps: true
    }
);

const zoomModel = mongoose.model("zoomModel", zoomSchema, "zoom");
module.exports = {
    zoomModel,
};