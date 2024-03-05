const { body } = require('express-validator')

const createOrganization = [
  body('superAdminId').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  // body('website').not().isEmpty(),
  body('address').not().isEmpty(),
  body('phone_number').not().isEmpty(),
]

const editOrganization = [
  // body('organization_id').not().isEmpty(),
  body('name').not().isEmpty(),
  body('email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const editUserOrganization = [
    body('email').not().isEmpty().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
]

const organizationDetail = [
  body('id').not().isEmpty()
]

const userOrganizationDetail = [
  body('_id').not().isEmpty()
]

const activeOrganization = [
  body('organizationId').not().isEmpty(),
  body('superAdminId').not().isEmpty(),
]

const declineOrganization = [
  body('organizationId').not().isEmpty(),
  body('superAdminId').not().isEmpty(),
]

const deactivateOrganization = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
]

const approveOrganization = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
]

const deleteOrganization = [
  body('id').not().isEmpty()
]

const organizationHdBySa = [
  body('superAdminId').not().isEmpty(),
  body('email').not().isEmpty(),
  body('_id').not().isEmpty(),
]


module.exports = {
  createOrganization,
  editOrganization,
  editUserOrganization,
  organizationDetail,
  userOrganizationDetail,
  activeOrganization,
  declineOrganization,
  deactivateOrganization,
  approveOrganization,
  deleteOrganization,
  organizationHdBySa
}
