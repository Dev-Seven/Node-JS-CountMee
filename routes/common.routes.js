const router = require('express').Router()
const commonController = require('./../controllers/common.controller')
const { setLanguage } = require('../middleware/auth.middleware')


router.post('/common/banner-list', setLanguage, commonController.bannerList)
// router.post('/common/createBanner', isUserAuthenticated, upload.fields([{ name: 'banner', maxCount: 4 }, { name: 'video', maxCount: 8 }]), validator.createBanner, setLanguage, commonController.createBanner)

module.exports = router;
