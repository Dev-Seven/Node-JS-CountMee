const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    organizationId : {
        type: String,
    },
    eventId : {
        type: String,
    },
    name : {
        type: String,
    },
    description: {
        type: String,
    },
    isRemove : {
        type: Boolean,
        default: false,
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

const notificationModel = mongoose.model("notificationModel", notificationSchema, "notification");
module.exports = {
    notificationModel,
};