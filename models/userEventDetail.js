const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userEventDetailSchema = new mongoose.Schema({
        id: {
          type: String,
          unique: true,
          index:true,
          sparse:true
        },
        eventId : {
          type: String,
        },
        userId : {
          type: String,
        },
        customFormId : {
          type: String,
        },
        customFieldValue : {
          type: String,
        },
    },
    {
      timestamps: true
    }
);

const userEventDetailModel = mongoose.model("userEventDetailModel", userEventDetailSchema, "userEventDetail");
module.exports = {
    userEventDetailModel,
};