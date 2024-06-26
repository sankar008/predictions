const { getApiResponse } = require('./../../Settings/settings');
const axios = require('axios');
const leaguesModule = require('./leagues.service');
const resultModule = require('./result.service');
const statisticsModule = require('./statistics.service');
const leaugeFav = require('./../League_Fav/favorite.service');
const { auth } = require('../../auth/jwt_token');
const mongoose = require('mongoose');

var moment = require('moment');

const getLeagues = async (req, res) => {
  try {
    let options = await getApiResponse({ endPoint: 'leagues', method: 'GET' });
    const response = await axios.request(options);

    if (response.status == 200) {
      response.data.response.map(async (items) => {
        let leagues = new leaguesModule({
          league: items.league,
          country: items.country,
          seasons: items.seasons
        });
        leaguesData = await leagues.save();
      });
    }

    return res.status(200).json({
      success: true,
      message: 'data insert successfully!!'
    });
  } catch (error) {
    console.error(error);
  }
};

const getAllLeaguesList = async (req, res) => {
  try {
    let limit = 10;
    let skip = req.params.skip ?? 0;
    let year = req.params.year ?? 2024;
    const countryArray = [
      'Australia',
      'Austria',
      'Argentina',
      'Angola',
      'Belgium',
      'Brazil',
      'Bulgaria',
      'Canada',
      'China',
      'Croatia',
      'Cyprus',
      'Czech Republic',
      'Denmark',
      'England',
      'Estonia',
      'Europe',
      'France',
      'Germany',
      'Greece',
      'Israel',
      'Italy',
      'India',
      'Mexico',
      'Malta',
      'Nigeria',
      'Netherlands',
      'Scotland',
      'Serbia',
      'South America',
      'Spain',
      'Switzerland',
      'Turkey',
      'Portugal',
      'Romania',
      'Russia',
      'Ukraine',
      'United Kingdom',
      'USA'
    ];
    var matchQuery = {
      'country.name': { $in: countryArray },
      'seasons.year': { $eq: year }
    };
    const leagues = await leaguesModule.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            country: '$country.name'
          },
          leagues: {
            $push: {
              id: '$league.id',
              name: '$league.name'
            }
          }
        }
      },
      {
        $sort: { '_id.country': 1 }
      },
      {
        $project: {
          _id: 0,
          countryName: '$_id.country',
          leagues: 1
        }
      }
    ]);

    const leagueObj = await Promise.all(
      leagues.map(async (items) => {
        const leaguesData = await Promise.all(
          items.leagues.map(async (leg) => {
            const authData = await auth(req.token_code);
            const isFav = await leaugeFav.findOne({ userId: new mongoose.Types.ObjectId(authData.result._id), leagueId: leg.id });
            leg.isFavorite = isFav ? true : false;
            return leg;
          })
        );        
        return items;
      })
    );

    return res.status(200).json({
      success: true,
      data: leagueObj
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getFixtures = async (schedule_date) => {
  try {
    let options = await getApiResponse({ endPoint: 'fixtures?date=' + schedule_date, method: 'GET' });
    const response = await axios.request(options);
    await Promise.all(
      response.data.response.map(async (items) => {
        if ((await resultModule.find({ 'league.id': items.league.id, 'league.season': items.league.season, 'fixture.id': items.fixture.id }).count()) == 0) {
          let result = new resultModule({
            fixture: items.fixture,
            league: items.league,
            teams: items.teams,
            goals: items.goals,
            score: items.score,
            events: items.events
          });
          resultData = await result.save();
        }
      })
    );
    return true;
  } catch (e) {
    return false;
  }
};

const getLiveLeagues = async (req, res) => {
  try {
    const countryArray = [
      'Australia',
      'Austria',
      'Argentina',
      'Angola',
      'Belgium',
      'Brazil',
      'Bulgaria',
      'Canada',
      'China',
      'Croatia',
      'Cyprus',
      'Czech Republic',
      'Denmark',
      'England',
      'Estonia',
      'Europe',
      'France',
      'Germany',
      'Greece',
      'Israel',
      'Italy',
      'India',
      'Mexico',
      'Malta',
      'Nigeria',
      'Netherlands',
      'Scotland',
      'Serbia',
      'South America',
      'Spain',
      'Switzerland',
      'Turkey',
      'Portugal',
      'Romania',
      'Russia',
      'Ukraine',
      'United Kingdom',
      'USA'
    ];

    const scheduleDate = req.params.schedule_date;
    if (scheduleDate) {
      const todayDate = moment(scheduleDate).format('YYYY-MM-DD');
      const nextDate = moment(scheduleDate).add(1, 'days').format('YYYY-MM-DD');
      var matchQuery = {
        'league.country': { $in: countryArray },
        'fixture.date': { $gte: todayDate, $lte: nextDate }
      };

      const isExists = await resultModule.find({ 'fixture.date': { $gte: todayDate, $lte: nextDate } }).count();
      if (isExists == 0) {
        await getFixtures(scheduleDate);
      }
    } else {
      let todayDate = moment().format('YYYY-MM-DD');
      let nextDate = moment().add(1, 'days').format('YYYY-MM-DD');
      let isExists = await resultModule.find({ 'fixture.date': { $gte: todayDate, $lte: nextDate } }).count();
      if (isExists == 0) {
        await getFixtures(scheduleDate);
      }
      var matchQuery = {
        'league.country': { $in: countryArray },
        'fixture.date': { $gte: todayDate, $lte: nextDate },
        'fixture.status.short': { $nin: ['FT', 'PST', 'NS', 'CANC', 'TBD'] }
      };
    }

    const authData = await auth(req.token_code);
    const favLeagues = await leaugeFav.find({ userId: new mongoose.Types.ObjectId(authData.result._id)});
    const objectData = await Promise.all(
      favLeagues.flatMap(async (favItems) => {
        const conditions = { ...matchQuery, ...{ 'league.id': favItems.leagueId } };

        const liveRecords = await resultModule.aggregate([
          { $match: conditions },
          {
            $group: {
              _id: {
                country: '$league.country',
                league: '$league.name',
                flag: '$league.flag',
                leagueId: '$league.id'
              },
              matches: {
                $push: {
                  id: '$fixture.id',
                  time: '$fixture.timestamp',
                  timeZone: '$fixture.timezone',
                  date: '$fixture.date',
                  result: { $cond: [{ $eq: ['$teams.home.winner', true] }, 'Home Win', { $cond: [{ $eq: ['$teams.away.winner', true] }, 'Away Win', null] }] },
                  status: '$fixture.status.long',
                  status_short: '$fixture.status.short',
                  home: {
                    teamName: '$teams.home.name',
                    logo: '$teams.home.logo'
                  },
                  away: {
                    teamName: '$teams.away.name',
                    logo: '$teams.away.logo'
                  }
                }
              }
            }
          },
          {
            $sort: { '_id.country': 1, 'matches.id': 1 }
          },
          {
            $project: {
              _id: 0,
              matches: 1,
              countryName: '$_id.country',
              leagueName: '$_id.league',
              flag: '$_id.flag',
              leagueId: '$_id.leagueId',
              isFavorite: true
            }
          }
        ]);

        if (liveRecords.length > 0) {
          var result = { ...liveRecords[0], ...{ isFavorite: true } };
        }
        return result;
      })
    );

    return res.status(200).json({
      success: true,
      data: objectData.filter(function (x) {
        return x != null;
      })
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getLiveHeadToHead = async (req, res) => {
  try {
    let options = await getApiResponse({ endPoint: 'fixtures/headtohead?h2h=' + req.params.h2h + '&league=' + req.params.leaguesId + '&season=' + req.params.seasonId, method: 'GET' });
    const response = await axios.request(options);
    return res.status(200).json({
      success: true,
      message: response.data.errors,
      data: response.data.response
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getPredictions = async (req, res) => {
  try {
    let options = await getApiResponse({ endPoint: 'predictions?fixture=' + req.params.fixtureId, method: 'GET' });
    const response = await axios.request(options);
    return res.status(200).json({
      success: true,
      message: response.data.errors,
      data: response.data.response
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    var responseData = '';
    var fixtureId = req.params.fixtureId;
    if ((await statisticsModule.find({ fixtureId: fixtureId }).count()) == 0) {
      let options = await getApiResponse({ endPoint: 'fixtures/statistics?fixture=' + req.params.fixtureId, method: 'GET' });
      const response = await axios.request(options);
      const dataArray = response.data.response;

      await Promise.all(
        dataArray.map(async (items) => {
          let result = new statisticsModule({
            fixtureId: fixtureId,
            team: items.team,
            statistics: items.statistics
          });
          resultData = await result.save();
        })
      );
    }

    responseData = await statisticsModule.find({ fixtureId: fixtureId });

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getLineup = async (req, res) => {
  try {
    let options = await getApiResponse({ endPoint: 'fixtures/lineups?fixture=' + req.params.fixtureId, method: 'GET' });
    const response = await axios.request(options);
    return res.status(200).json({
      success: true,
      message: response.data.errors,
      data: response.data.response
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

const getEvent = async (req, res) => {
  try {
    let options = await getApiResponse({ endPoint: 'fixtures/events?fixture=' + req.params.fixtureId, method: 'GET' });
    const response = await axios.request(options);
    return res.status(200).json({
      success: true,
      message: response.data.errors,
      data: response.data.response
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

module.exports = {
  getLeagues: getLeagues,
  getAllLeaguesList: getAllLeaguesList,
  getLiveLeagues: getLiveLeagues,
  getLiveHeadToHead: getLiveHeadToHead,
  getPredictions: getPredictions,
  getFixtures: getFixtures,
  getStatistics: getStatistics,
  getLineup: getLineup,
  getEvent: getEvent
};
