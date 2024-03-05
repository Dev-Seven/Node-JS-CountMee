const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const validator = require('../validators/auth.validators')
const { setLanguage , isUserAuthenticated , isUserValidate, grantAccess , allowIfLoggedin } = require('../middleware/auth.middleware')

router.post('/auth/login', isUserValidate, validator.userLogin, setLanguage, authController.userLogin)
router.post('/auth/signUp', isUserValidate, validator.userSignup, setLanguage, authController.userSignup)
router.post('/user/logout', isUserAuthenticated, authController.userLogout)

router.get('/user/:userId', allowIfLoggedin, authController.getUser)
router.get('/users', allowIfLoggedin, grantAccess('readAny', 'event'), authController.getUsers)
router.put('/user/:userId', allowIfLoggedin, grantAccess('updateAny', 'event'), authController.updateUser)
router.delete('/user/:userId', allowIfLoggedin, grantAccess('deleteAny', 'event'), authController.deleteUser)
module.exports = router;
