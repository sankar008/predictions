const router = require('express').Router();
const { createVote, getFixtureDetails} = require('./vote.controller');
const { checkToken } = require("../../auth/jwt_token");


router.post('/', checkToken, createVote);
router.get('/:fixtureId', checkToken, getFixtureDetails);

module.exports = router;