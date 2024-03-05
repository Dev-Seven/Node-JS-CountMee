const mongoose = require('mongoose');

const informationDeskSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: mongoose.Schema.Types.ObjectId,
    },
    type : {
        type: String,
        default: 'event',
        enum : [ 'event', 'speaker', 'sponsor'],
    },
    message : {
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

const informationDeskModel = mongoose.model("informationDeskModel", informationDeskSchema, "informationDesk");
module.exports = {
    informationDeskModel,
};