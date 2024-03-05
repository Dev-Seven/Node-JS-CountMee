const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const organizationSchema = new mongoose.Schema({
        id: {
          type: String,
          unique: true,
          index:true,
          sparse:true
        },
        superAdminId : {
          type: String,
          // required: true,
          allowNull: false,
          default : null,
        },
        name : {
          type: String,
          required: true,
          default: null
        },
        description : {
          type: String,
        },
        logo : {
          type: String,
          data: Buffer,
          allowNull: true,
        },
        email: {
          type: String,
          // required: [true, "Email is required"],
          // trim:true,
          // lowercase: true,
          // unique: true,
          // index:true,
          // sparse:true
        },
        password: {
          type: String,
          // trim:true,
          // default : "",
        },
        plain_password: {
          type: String,
        },
        country_name : {
          type: String,
          default: "India"
        },
        state : {
          type: String,
          default: null
        },
        city: {
          type: String,
          default: null
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
          // default: 'organization',
          enum : [ 'organization', 'admin', 'support', 'sponsor', 'speaker', 'partner'],
        },
        isActive : {
          type: Boolean,
          default: true
        },
        isDeactive : {
          type: Boolean,
          default: false
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

organizationSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

organizationSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const organizationModel = mongoose.model("organizationModel", organizationSchema, "organization");
module.exports = {
    organizationModel,
};