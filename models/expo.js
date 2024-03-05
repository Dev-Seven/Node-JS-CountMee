const mongoose = require('mongoose');

const expoSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: String,
        // required: true,
        // allowNull: false
    },
    name: {
        type: String,
    },
    website : {
        type: String,
    },
    // logo : {
    //     type: String,
    //     data: Buffer,
    //     allowNull: true,
    // },
    banner : {
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
    product_catalouge : {
        type: String,
        data: Buffer,
        allowNull: true,
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
    username_email: {
        type: String,
        // trim:true,
        // lowercase: true,
        // unique: true,
    },
    password: {
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

expoSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  };
  
expoSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

const expoModel = mongoose.model("expoModel", expoSchema, "expo");
module.exports = {
    expoModel,
};