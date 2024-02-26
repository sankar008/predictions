const router = require('express').Router();
const { createVote, getFixtureDetails, getMyvoteDetails, getAllvoteDetails} = require('./vote.controller');
const { checkToken } = require("../../auth/jwt_token");


router.post('/', checkToken, createVote);
router.get('/:fixtureId', checkToken, getFixtureDetails);
router.get('/my/vote', checkToken, getMyvoteDetails);
router.get('/all/vote', checkToken, getAllvoteDetails);


module.exports = router;