const router = require('express').Router()
const userController = require('./../controllers/user.controller')
const validator = require('../validators/user.validators')
const { isUserAuthenticated , isUserValidate, setLanguage } = require('../middleware/auth.middleware')
const  { upload, uploadCsv }  = require('../middleware/upload.middleware')


router.post('/user/allUser', isUserAuthenticated, setLanguage, userController.allUser)
router.post('/user/editProfile', isUserAuthenticated, upload.array('logo'), validator.editProfile, setLanguage, userController.editProfile)
router.post('/user/otpForgetPassword', isUserAuthenticated, setLanguage, userController.otpForgetPassword)
router.post('/user/changePassword', isUserAuthenticated, setLanguage, userController.changePassword)
router.post('/user/userDetail', isUserAuthenticated, setLanguage, validator.userDetail, userController.userDetail)
router.post('/user/resetPassword', validator.resetPassword, setLanguage, userController.resetPassword)
router.post('/user/resetPwdUser', isUserValidate, validator.resetPwdUser, setLanguage, userController.resetPwdUser)
router.post('/user/allDeletedUser', isUserAuthenticated, setLanguage, userController.allDeletedUser)
router.post('/user/deleteUser', isUserAuthenticated, validator.deleteUser, setLanguage, userController.deleteUser)

module.exports = router;
