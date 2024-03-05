const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        index:true,
        sparse:true
    },
    eventId : {
        type: String,
        // required: true,
        allowNull: false
    },
    name: {
        type: String,
    },
    avatar : {
        type: String,
        data: Buffer,
        allowNull: true,
    },
    description: {
        type: String,
    },
    website : {
        type: String,
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
    starts_at : {
        type: String,
    },
    ends_at : { 
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
    username_email : {
        type: String,
        // required: [true, "Email is required"],
        // trim:true,
        // lowercase: true,
        // unique: true,
    },
    password: {
        type: String,
    },
    designation : {
        type: String,
    },
    isFeatured : {
        type: Boolean,
        default: false
    },
    speaker_list : {
        type: String,
    },
    code : {
        type: String,
        allowNull: true,
        default: '',
    },
    banner_cat: {
        type: String,
        // enum: ['fullBanner', 'halfBanner', 'medBanner']
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

speakerSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  };
  
speakerSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

const speakerModel = mongoose.model("speakerModel", speakerSchema, "speaker");
module.exports = {
    speakerModel,
};