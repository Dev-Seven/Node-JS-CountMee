const { body } = require('express-validator')

const userLogin = [
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('password').not().isEmpty().isLength({ min: 8, max:20})
]

const userSignup = [
  // body('role').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  body('password', 'Password must be including 1 upper case character, special character and alphanumeric and minimum length is 8 characters.')
.escape()
.exists({checkFalsy: true})
.isLength({min: 8, max:100})
.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")]

module.exports = {
  userLogin,
  userSignup
}
