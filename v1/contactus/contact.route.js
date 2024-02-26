const router = require('express').Router();
const { sendEmail } = require('./contact.controller');
const { checkToken } = require("../../auth/jwt_token");

router.post('/', checkToken, sendEmail);

module.exports = router;