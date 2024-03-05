const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const customFormSchema = new mongoose.Schema({
        id: {
          type: String,
          unique: true,
          index:true,
          sparse:true
        },
        eventId : {
          type: String,
        },
        name : {
          type: String,
          required: true,
        },
        lable : {
          type: String,
          required: true,
        },
        input_type : {
          type: String,
          required: true,
          default: 'TextField',
          enum : [ 'TextField', 'TextArea', 'Selection', 'RadioButton', 'Checkbox', 'Number'],
        },
        placeholder : {
          type: String,
          // required: true,
        },
        radioGroup : {
          type: String,
        },
        radioName: {
          type: Array,
          allowNull: true,
          default: []
        },
        selectionOption: {
          type: Array,
          allowNull: true,
          default: []
        },
        sequence: {
          type: Number,
          default: 1
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

const customFormModel = mongoose.model("customFormModel", customFormSchema, "customForm");
module.exports = {
    customFormModel,
};