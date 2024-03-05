/* eslint-disable no-empty */
/* eslint-disable prefer-promise-reject-errors */
const { catchError, response } = require('../services/utilities')
const { status, jsonStatus } = require('./../api.response')
const { staticPageModel }  = require('../models/staticPage')
const { generalSettingModel } = require('../models/generalSetting')
const { bannerModel } = require('../models/banner')
const { CACHE_1} = require('../config')

class Common {

  async bannerList(req, res) {
    try {
      let data = await bannerModel.find({
        where: { type: ['Speaker', 'Sponsor'], status_id: 1, is_deleted: 0 },
        raw: true,
        attributes: {
          exclude: ['status_id', 'is_deleted', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by']
        }
      })

      if (!data) {
        return response(req, res, status.OK, jsonStatus.OK, 'success', { data: [] })
      }
      // data = data.map(s => {
      //   if (s.image) s.image = `${S3_BUCKET_URL}banner/${s.image}`
      //   return s
      // })
      return response(req, res, status.OK, jsonStatus.OK, 'success', { data: data || [] })
    } catch (error) {
      return catchError('Common.bannerList', error, req, res)
    }
  }
}

module.exports = new Common()
