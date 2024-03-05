const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
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
    website : {
        type: String,
    },
    logo : {
        type: String,
        data: Buffer,
        allowNull: true,
    },
    banner : {
        type: String,
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
    isFeatured : {
        type: Boolean,
        default: false
    },
    sponsor_list : {
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

sponsorSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  };
  
  sponsorSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

const sponsorModel = mongoose.model("sponsorModel", sponsorSchema, "sponsor");
module.exports = {
    sponsorModel,
};