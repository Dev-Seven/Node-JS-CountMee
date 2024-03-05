const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // user_id: {
  //   type: String,
  //   default: "user_admin"
  // },
  // username: {
  //   type: String,
  //   required: [true, 'Please enter a username'],
  //   unique: true
  // },
  // full_name: {
  //   type: String,
  //   required: [true, 'Please enter a fullName']
  // },
  superAdminId : {
    type: String,
  },
  eventId : {
    type: String,
  },
  first_name : {
    type: String,
  },
  last_name : {
    type: String,
  },
  name : {
    type: String,
  },
  options : {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female']
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
  otp : {
    type: String,
  },
  password: {
    type: String,
    // trim:true,
    // required: [true, 'Please enter a password'],
    // minLength: 8,
    // maxlength: 100,
    // default: '',
  },
  plain_password: {
    type: String,
  },
  customField: {
    type: Array,
  },
  country_name : {
    type: String,
  },
  auth_key: {
    type: String,
  },
  designation : {
    type: String,
  },
  phone_number : {
    type: Array,
  },
  website : {
    type: String,
  },
  address : {
    type: String,
  },
  role : {
    type: String,
    // default: 'support',
    enum : [ 'superAdmin', 'admin', 'support', 'sponsor', 'speaker', 'partner', 'organization', 'expo', 'user'],
  },
  accessToken: {
    type: String
  },
  logo : {
    type: String,
    data: Buffer,
    allowNull: true,
  },
  seat1 : {
    type : Boolean,
  },
  seat2 : {
      type : Boolean,
  },
  seat3 : {
      type : Boolean,
  },
  seat4 : {
      type : Boolean,
  },
  isActive : {
    type: Boolean,
    default: true
  },
  isDeactive : {
    type: Boolean,
    default: false
  },
  isSessionWatch : {
    type: Boolean,
    default: false
  },
  isStageWatch : {
    type: Boolean,
    default: false
  },
  isRequestedUser : {
    type: Boolean,
    default : true
  },
  isLoungeUser : {
    type: Boolean,
    default : false
  },
  isChatUser : {
    type: Boolean,
    default : false
  },
  is_deleted: {
    type: Number,
    default: 0
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
},
);

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const userModel = mongoose.model("userModel", userSchema, "user");
module.exports = {
  userModel,
};