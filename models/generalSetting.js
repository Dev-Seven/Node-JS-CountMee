const mongoose = require('mongoose');

const generalSettingSchema = new mongoose.Schema({
      id: {
        autoIncrement: true,
        type: String,
        allowNull: false

      },
      name: {
        type: String,
        allowNull: false
      },
      value: {
        type: String,
        allowNull: false,
        defaultValue: ''
      },
    },
    {
      timestamps: true
    }
    )

const generalSettingModel = mongoose.model("generalSettingModel", generalSettingSchema, "generalSetting");
module.exports = {
    generalSettingModel,
};