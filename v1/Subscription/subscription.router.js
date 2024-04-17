const router = require('express').Router();
const {createSubscription} = require('./subscription.controller');
const { checkToken } = require("../../auth/jwt_token");
router.post('/', checkToken, createSubscription);
module.exports = router;