const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userRegEventSchema = new mongoose.Schema({
        id: {
          type: String,
          unique: true,
          index:true,
          sparse:true
        },
        eventId : {
          type: String,
        },
        options : {
          type: String,
        },
        id : {
          type: String,
        },
        first_name : {
          type: String,
        },
        last_name : {
          type: String,
        },
        gender: {
          type: String,
          enum: ['male', 'female']
        },
        email : {
          type: String,
        },
        password : {
          type: String,
          trim:true,
          required: [true, 'Please enter a password'],
          minLength: 8,
          maxlength: 100,
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

userRegEventSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

userRegEventSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const userRegEventModel = mongoose.model("userRegEventModel", userRegEventSchema, "userRegEvent");
module.exports = {
    userRegEventModel,
};