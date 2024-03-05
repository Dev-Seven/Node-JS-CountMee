const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const eventSchema = new mongoose.Schema({
        id: {
          type: String,
          unique: true,
          index:true,
          sparse:true
        },
        organizationId : {
          type: String,
          // required: true,
          // allowNull: false
        },
        superAdminId : {
          type: String,
        },
        title: {
            type: String,
            // required: true,
        },
        name : {
          type: String,
        },
        description: {
          type: String,
        },
        overview: {
            type: String,
            // required: true,
        },
        banner : {
          type: String,
          data: Buffer,
          allowNull: true,
        },
        logo : {
          type: String,
          data: Buffer,
          allowNull: true,
        },
        eve_logo_sly : {
          type: Array,
          data: Buffer,
          allowNull: true,
        },
        eve_video : {
          type: String,
          data: Buffer,
          allowNull: true,
        },
        eve_login_banner : {
          type: String,
          data: Buffer,
          allowNull: true,
        },
        // video : {
        //   type: Array,
        //   data: Buffer,
        //   allowNull: true,
        // },
        communication : {
          type: String,
          //enum : [ 'Meet', 'Chat', 'Both'],
          allowNull: true,
        },
        timezone : {
          type: String,
        },
        status: {
          type: Number,
          default: 1   // 0 : inActive , 1 : Active , -1 : Deleted
        },
        starts_at : {
          type: String,
        },
        ends_at : { 
          type: String,
        },
        starts_at_m : {
          type: String,
        },
        ends_at_m : { 
          type: String,
        },
        date : {
          type: String,
        },
        url : {
          type: String,
        },
        default_event_url : {
          type: String,
          default:`${process.env.DEFAULT_EVENT_URL}/voe/voeevent/`,
        },
        custom_url : {
          type: String,
          allowNull: true,
          default: '',
        },
        url_type : {
          type: String,
          // allowNull: true,
          // enum : [ 'Custome_Url', 'Default_Url'],
        },
        stage : {
          type: Boolean
        },
        sessions : {
          type: Boolean
        },
        networking : {
          type: Boolean
        },
        expo : {
          type: Boolean
        },
        theme_colorone : {
          type: String,
        },
        theme_colortwo : {
          type: String,
        },
        facebook : {
            type: String,
        },
        twitter : {
          type: String,
        },
        youtube : {
          type: String,
        },
        instagram : {
            type: String,
        },
        linkedin : {
            type: String,
        },
        contentUrl : {
          type: String,
        },
        isActive : {
          type: Boolean,
          default: false
        },
        isDecline : {
          type: Boolean,
          default: false
        },
        is_cancel: {
          type: Boolean,
          default: false
        },
        is_postponed: {
          type: Boolean,
          default: false
        },
        is_reschedule: {
          type: Boolean,
          default: false
        },
        eventCancelDate: {
          type: Date,
          default: null
        },
        eventPostPondDate: {
          type: Date,
          default: null
        },
        eventRescheduleDate: {
          type: Date,
          default: null
        },
        deleted_by: {
          type: String,
          allowNull: true,
          default: ''
        },
        deleted_by_org : {
          type: String,
          allowNull: true,
          default: ''
        }
    },
    {
      timestamps: true
    }
);

const eventModel = mongoose.model("eventModel", eventSchema, "event");
module.exports = {
    eventModel,
};