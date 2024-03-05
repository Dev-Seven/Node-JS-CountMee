const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const superAdminSchema = new mongoose.Schema({
    admin_users:{
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide the email'],
        lowercase: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 8,
        maxlength: 100, 
    },
    name: {
        type: String,
        required: [true, 'Please provide the name'],
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum : ['superAdmin','admin', 'support'],
        allowNull: true
      },
},
{
    timestamps: true
}
)

superAdminSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  };
  
  superAdminSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

const superAdminModel = mongoose.model("superAdminModel", superAdminSchema, "superAdmin");
module.exports = {
    superAdminModel,
};