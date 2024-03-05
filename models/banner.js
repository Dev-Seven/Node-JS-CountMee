const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
      id: {
        type: String,
        required: true,
        unique: true
      },
      name: {
        type: String,
        allowNull: true
      },
      description: {
        type: String,
        allowNull: true
      },
      image: {
        type: String,
        allowNull: true
      },
      visit_url: {
        type: String,
        allowNull: true
      },
      total_click: {
        type: String,
        allowNull: true,
        defaultValue: 0
      },
      type: {
        enum : ['Session', 'Organization', 'Speaker'],
        // allowNull: true,
      },
      slug: {
        type: String,
        allowNull: true
      },
      status: {
        type: Number,
        default: 1   // 0 : inActive , 1 : Active , -1 : Deleted
      },
      status_id: {
        type: String,
        allowNull: false,
        comment: 'Status',
        references: {
          model: 'status',
          key: 'id'
        }
      },
      is_deleted: {
        type: String,
        allowNull: false,
        defaultValue: 0,
        comment: 'Is Deleted'
      },
      created_by: {
        type: String,
        allowNull: true,
        comment: 'Created By'
      },
      updated_by: {
        type: String,
        allowNull: true,
        comment: 'Updated By'
      },
      deleted_by: {
        type: String,
        allowNull: true,
        comment: 'Deleted By'
      }
    },
    {
      timestamps: true
    }
)
  
const bannerModel = mongoose.model("bannerModel", bannerSchema, "banner");
module.exports = {
    bannerModel,
};