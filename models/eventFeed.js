const mongoose = require('mongoose');

const eventFeedSchema = new mongoose.Schema({
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
    eveFeedType : {
        type: String,
        enum : ['Discuss', 'Introduce']
    },
    feedIntroduceType : {
        type: String,
        enum : ['i_am_looking_for', 'i_am_offering']
    },
    description: { 
        type: String, 
        required: false
    },
    docType : {
        type: String,
        // enum : ['Image', 'Video', 'Pdf']
    },
    doc : {
        type: Array,
        data: Buffer,
        allowNull: true,
    },
    isFlagged : {
        type: Boolean,
        default: false,
    },
    comments: {
        type: String, 
    },
    likes: { 
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

const eventFeedModel = mongoose.model("eventFeedModel", eventFeedSchema, "eventFeed");
module.exports = {
    eventFeedModel,
};