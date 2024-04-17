const router = require('express').Router();
const { getAllLeaguesList, getLiveLeagues, getLiveHeadToHead, getPredictions, getFixtures, getStatistics, getLineup, getEvent} = require('./leagues.controller');
const { checkToken } = require("../../auth/jwt_token");

router.get('/all/:skip?', checkToken, getAllLeaguesList);
router.get('/fixture/result/:schedule_date?', checkToken, getLiveLeagues);
router.get('/live/head/:h2h/:leaguesId/:seasonId', checkToken, getLiveHeadToHead);
router.get('/predictions/:fixtureId', checkToken, getPredictions);
router.get('/live/fixture/all', checkToken, getFixtures);
router.get('/statistics/:fixtureId', getStatistics);
router.get('/lineup/:fixtureId', getLineup);
router.get('/event/:fixtureId', getEvent);

module.exports = router;