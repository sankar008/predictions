const router = require('express').Router();
const { addLeagueFavorite, getLeagueFavorite} = require('./favorite.controller');
const { checkToken } = require("../../auth/jwt_token");

router.post('/', checkToken, addLeagueFavorite);
router.get('/', checkToken, getLeagueFavorite);

module.exports = router;