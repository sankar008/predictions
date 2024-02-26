const voteModel = require("./vote.service");
const axios = require('axios');
const result    = require("./../Leagues/result.service");
const predictionModel = require('./../vote/predictions.service');
const { auth } = require("../../auth/jwt_token");
const mongoose = require('mongoose');
const { getApiResponse } = require('./../../Settings/settings');

const createVote = async (req, res) => {
    const body = req.body;
    try{
        const authData = await auth(req.token_code);
        const loginId = new mongoose.Types.ObjectId(authData.result._id);
     
        let updateData = await voteModel.findOneAndUpdate({ "fixtureId": body.fixtureId, "userId":  loginId}, {
            "fixtureId": body.fixtureId,
            'userId':    loginId,
            'vottingFor': body.vottingFor
        }, { upsert: true, useFindAndModify: true })
        
        return res.status(200).json({
            success: true,
            message: "Success!!"
        })

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const getFixtureDetails = async (req, res) => {
    try{
        const fixtureId = parseInt(req.params.fixtureId);
        const matchQuery = {"fixture.id": fixtureId}
        
        const fixtureDetails = await result.findOne(matchQuery);

        const gameStatusArray = ['2H', 'NS'];       
        const isExists = await predictionModel.findOne({"fixtureId": fixtureId}).count();
        if(fixtureDetails){
            if(gameStatusArray.includes(fixtureDetails?.fixture.status.short) === false || isExists === 0){ 
                let options = await getApiResponse({ endPoint: "predictions?fixture=" + req.params.fixtureId, method: "GET" });
                const response = await axios.request(options);
                const predictionRes = response.data.response[0];
                let updateData = await predictionModel.findOneAndUpdate({ "fixtureId": fixtureId }, {
                    fixtureId: fixtureId,
                    predictions: predictionRes.predictions,
                    league: predictionRes.league,
                    teams: predictionRes.teams,
                    comparison: predictionRes.comparison,
                    h2h: predictionRes.h2h,
                }, { upsert: true, useFindAndModify: true })
            }
        }else{ 
            return res.status(400).json({
                success: false,
                message: "Fixture id does not exists"
             })
        }   
        
        const  predictionData = await predictionModel.findOne({"fixtureId": fixtureId})

        const authData = await auth(req.token_code);
        const loginId = new mongoose.Types.ObjectId(authData.result._id);

         let totalVote = await voteModel.find({fixtureId: fixtureId}).count();
         let isVoted   = await voteModel.findOne({fixtureId: fixtureId, userId: loginId});
        
         let totalHomeWin = await voteModel.find({fixtureId: fixtureId, 'vottingFor.home': 1}).count();        
         let totalAwayWin = await voteModel.find({fixtureId: fixtureId, 'vottingFor.away': 1}).count();
         let totalDrawWin = await voteModel.find({fixtureId: fixtureId, 'vottingFor.home': 0, 'vottingFor.away': 0}).count();
        
        const resultObj = {
            total_vote: totalVote,
            isvoted: isVoted.vottingFor,
            home: {
                logo: fixtureDetails.teams.home.logo,
                teamName: fixtureDetails.teams.home.name,
                goals: fixtureDetails.goals.home,
            },
            away: {
                logo: fixtureDetails.teams.away.logo,
                teamName: fixtureDetails.teams.away.name,
                goals: fixtureDetails.goals.away,
            },
            status: {
                matchStatus: fixtureDetails.fixture.status.long,
                elapsed: fixtureDetails.fixture.status.elapsed,
            },
            probability: {
                home: (totalHomeWin/totalVote)*100 + '%',
                away: (totalAwayWin/totalVote)*100 + '%',
                draw: (totalDrawWin/totalVote)*100 + '%',
            },
            odds:{
                "home":1.07,
                "away":1.2,
                "draw":2,
            },
            predictions: predictionData.predictions,
            h2h: predictionData.h2h,
            comparison: predictionData.comparison,
        }
        

        return res.status(200).json({
            success: true,
            data: resultObj

        })

    }catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

module.exports = {
    createVote: createVote,
    getFixtureDetails: getFixtureDetails
}