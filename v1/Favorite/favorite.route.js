const router = require('express').Router();
const { addFavorite, getFavorite} = require('./favorite.controller');
const { checkToken } = require("../../auth/jwt_token");

router.post('/', checkToken, addFavorite);
router.get('/', checkToken, getFavorite);

module.exports = router;