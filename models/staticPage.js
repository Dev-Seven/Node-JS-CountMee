const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema({
    id: {
      autoIncrement: true,
      type: String,
      allowNull: false,
    },
    name: {
        type: String,
        allowNull: true
    },
    description: {
        type: String,
        allowNull: true
    },
    created_by: {
      type: Date,
      allowNull: true
    },
    updated_by: {
      type: Date,
      allowNull: true
    },
  },
  {
    timestamps: true
  }
  )

const staticPageModel = mongoose.model("staticPageModel", staticPageSchema, "staticPage");
module.exports = {
    staticPageModel,
};