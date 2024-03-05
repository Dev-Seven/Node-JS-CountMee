const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: String,
    },
    name: {
        type: String,
    },
    logo : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    description: {
        type: String,
    },
    youtube_embed_url: {
        type: String,
    },
    catalouge : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    website : {
        type: String,
    },
    facebook : {
        type: String,
    },
    instagram : {
        type: String,
    },
    twitter : {
        type: String,
    },
    linkedin : {
        type: String,
    },
    address : {
        type: String,
    },
    phone_number : {
        type: Array,
    },
    email: {
        type: Array,
        // required: [true, "Email is required"],
        // trim:true,
        // lowercase: true,
        // unique: true,
    },
    code : {
        type: String,
        allowNull: true,
        default: '',
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

const partnerModel = mongoose.model("partnerModel", partnerSchema, "partner");
module.exports = {
    partnerModel,
};