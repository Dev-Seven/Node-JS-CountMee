const { body, query } = require('express-validator')

const changePassword = [
  body('password').not().isEmpty(),
  body('new_password').not().isEmpty()
]

const editProfile = [
  body('_id').not().isEmpty(),
  // body('first_name').not().isEmpty(),
  // body('last_name').not().isEmpty(),
  // body('email').not().isEmpty()
]

const deleteUser = [
  body('id').not().isEmpty()
]

const userDetail = [
  body('id').not().isEmpty()
]

const resetPassword = [
  // body('eventId').not().isEmpty(),
  body('email').not().isEmpty()
]

const resetPwdUser = [
  body('email').not().isEmpty(),
  body('eventId').not().isEmpty()
]

module.exports = {
  changePassword,
  editProfile,
  deleteUser,
  userDetail,
  resetPassword,
  resetPwdUser
}
