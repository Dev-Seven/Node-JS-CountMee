const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  user_id: {
    type: String,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  },
    user_device_id: {
      autoIncrement: true,
      type: String,
      allowNull: false,
    },
    request_uri: {
      type: String,
    },
    refererurl : {
      type: String,
    },
    ip_address: {
      type: String,
    },
    remote_address: {
      type: String,
    },
    browser_version: {
      type: String,
    },
    user_platform: {
      type: String,
    },
    device_unique_id : {
      type : String,
      allowNull: true,
    },
    auth_key: {
      type: String,
      allowNull: true
    },
    device_name: {
      type: String,
      allowNull: true
    },
    push_token: {
      type: String,
      allowNull: true
    },
    language_code: {
      type: String,
      allowNull: false,
      defaultValue: 'en'
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
  );

  const userDeviceModel = mongoose.model("userDeviceModel", userDeviceSchema, "userDevice");
  module.exports = {
    userDeviceModel,
  };