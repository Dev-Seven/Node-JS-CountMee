const mongoose = require('mongoose');

const zmKeySchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    email: {
        type: String,
    },
    api_key: {
        type: String,
    },
    api_secret: {
        type: String,
    },
    token : {
        type: String,
    },
    meetType : {
        type : String,
    },
    status: {
        type: Number,
        default : 1,
    },
    },
    {
        timestamps: true
    }
);

const zmKeyModel = mongoose.model("zmKeyModel", zmKeySchema, "zmKey");
module.exports = {
    zmKeyModel,
};