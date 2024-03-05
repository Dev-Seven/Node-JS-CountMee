const router = require('express').Router()
const firebaseController = require('../controllers/firebase.controller')
const validator = require('../validators/firebase.validators')
const { setLanguage , isUserAuthenticated , grantAccess , allowIfLoggedin } = require('../middleware/auth.middleware')


router.post('/sendMessage',isUserAuthenticated, firebaseController.sendMessage);
router.get('/registerToTopic',auth, firebaseController.registerToTopic);

module.exports = router;