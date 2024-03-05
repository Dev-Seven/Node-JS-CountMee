const mongoose = require('mongoose');

const sponsorCollSchema = new mongoose.Schema({
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

const sponsorCollModel = mongoose.model("sponsorCollModel", sponsorCollSchema, "sponsorColl");
module.exports = {
    sponsorCollModel,
};