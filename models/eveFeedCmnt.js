const mongoose = require('mongoose');

const eveFeedCmntSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    eventFeedPostId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    comments : {
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
    cmnt_deleted_by_user : {
        type: String,
      },
    },
    {
        timestamps: true
    }
);

const eveFeedCmntModel = mongoose.model("eveFeedCmntModel", eveFeedCmntSchema, "eveFeedCmnt");
module.exports = {
    eveFeedCmntModel,
};