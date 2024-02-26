const cron = require('node-cron');
const moment = require('moment');
const mongodb = require('./../db');
const leaguesModule = require("./../v1/Leagues/leagues.service");
const { getApiResponse } = require('./../Settings/settings');
const resultModule = require('./../v1/Leagues/result.service');
const axios = require('axios');

cron.schedule('21 2 * * *', async function() {
    try{
        let start_time = moment().format("HH:mm") 
        console.log("Run league api "+ start_time);

         let league = await leaguesModule.deleteMany({});      

        let options = await getApiResponse({ endPoint: "leagues", method: "GET" });
        const response = await axios.request(options);
        if (response.status == 200) {
          response.data.response.map(async (items) => {
            let leagues = new leaguesModule({
              league: items.league,
              country: items.country,
              seasons: items.seasons
            })
            leaguesData = await leagues.save();

          })
        }

        let end_time = moment().format("HH:mm") 
        console.log("End league api "+ end_time);
    } catch (error) {
        console.log('error in processing data ', error);
    }
});


cron.schedule('* * * * *', async function () {
    try {
        let start_time = moment().format("HH:mm")
        console.log("Run live data api " + start_time);
        let options = await getApiResponse({ endPoint: "fixtures?live=all", method: "GET" });
        const response = await axios.request(options);
        if (response.status == 200) {            
            response.data.response.map(async (items) => {
                let updateData = await resultModule.findOneAndUpdate({ "fixture.id": items.fixture.id }, {
                    fixture: items.fixture,
                    league: items.league,
                    goals: items.goals,
                    score: items.score,
                    events: items?.events,
                    teams: items.teams,
                }, { upsert: true, useFindAndModify: true })


            })
        }
        let end_time = moment().format("HH:mm")
        console.log("End live data api " + end_time);
    } catch (error) {
        console.log('error in processing data ', error);
    }
});

cron.schedule('* * * * *', async function () {
    try {
        console.log("start update status");
        const fixture = await resultModule.updateMany({"fixture.status.elapsed" : 90}, {"fixture.status": {
            "long": "Match Finished",
            "short": "FT",
            "elapsed": 90
        }});
        console.log("Update status");
    } catch (error) {
        console.log('error in processing data ', error);
    }
});