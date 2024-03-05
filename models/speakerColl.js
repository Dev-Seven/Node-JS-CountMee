const mongoose = require('mongoose');

const speakerCollSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    superAdminId : {
        type: String,
    },
    eventId : {
        type: String,
    },
    categoryName: {
        type: String,
    },
    sequence : {
        type: Number,
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

const speakerCollModel = mongoose.model("speakerCollModel", speakerCollSchema, "speakerColl");
module.exports = {
    speakerCollModel,
};