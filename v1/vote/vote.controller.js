const voteModel = require("./vote.service");
const axios = require('axios');
const result    = require("./../Leagues/result.service");
const predictionModel = require('./../vote/predictions.service');
const { auth } = require("../../auth/jwt_token");
const mongoose = require('mongoose');
const { getApiResponse } = require('./../../Settings/settings');
const { promises } = require("nodemailer/lib/xoauth2");

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
            isvoted: isVoted?.vottingFor,
            session: fixtureDetails.league.season,
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
                home: ((totalHomeWin/totalVote)*100).toFixed(2) + '%',
                away: ((totalAwayWin/totalVote)*100).toFixed(2) + '%',
                draw: ((totalDrawWin/totalVote)*100).toFixed(2) + '%',
            },
            odds:{
                "home":1.07,
                "away":1.2,
                "draw":2,
            },
            predictions: predictionData.predictions,
            teams: predictionData.teams,
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

const getMyvoteDetails = async (req, res) => {
    try{
        const authData = await auth(req.token_code);
        const loginId = new mongoose.Types.ObjectId(authData.result._id);



        const myData = await voteModel.aggregate([
            {
                $lookup : {
                    from: "results",
                    localField: "fixtureId",
                    foreignField: "fixture.id",
                    as: "myMatch"
                }
            },
            {
                $match: {userId: loginId}
            },
            {
                $unwind: "$myMatch"
            },
            {
                $project: {
                    '_id': 0,
                    'fixtureId': 1,
                    'userId': 1,
                    'myMatch.fixture.date': 1,
                    'myMatch.fixture.timestamp': 1,
                    'myMatch.teams.home.name': 1 ,
                    'myMatch.teams.home.logo': 1,
                    'myMatch.teams.away.name': 1 ,
                    'myMatch.teams.away.logo': 1     
                }
            }
        ]);


        const myMatchData = await Promise.all(myData.map(async (items)=>{
            let totalVote    = await voteModel.find({fixtureId: items.fixtureId}).count();
            let totalHomeWin = await voteModel.find({fixtureId: items.fixtureId, 'vottingFor.home': 1}).count();        
            let totalAwayWin = await voteModel.find({fixtureId: items.fixtureId, 'vottingFor.away': 1}).count();
            let totalDrawWin = await voteModel.find({fixtureId: items.fixtureId, 'vottingFor.home': 0, 'vottingFor.away': 0}).count();
            items.totalVote  = totalVote;
            items.voteInPercentage = {
                home: ((totalHomeWin/totalVote)*100).toFixed(2) + '%',
                away: ((totalAwayWin/totalVote)*100).toFixed(2) + '%',
                draw: ((totalDrawWin/totalVote)*100).toFixed(2) + '%',
            };
            return items;
        })) 

        return res.status(200).json({
            success: true,
            data: myMatchData
        })

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const getAllvoteDetails = async (req, res) => {
    try{

        const vottingData = await voteModel.aggregate([
            {
                $group: {
                    "_id": "$fixtureId",
                    count: { $sum: 1 }
                }
            },
            {
                $sort:{"count": -1, "_id": 1}
            },
        ])

        const myMatchData = await Promise.all(vottingData.map(async (items)=>{

            const matchQuery = {"fixture.id": items._id, "fixture.status.short": { $nin: ['FT', 'PST', 'CANC'] }}  

            const fixtureDetails = await result.findOne(matchQuery); 
                      

            if(fixtureDetails != null){
                let totalVote    = await voteModel.find({fixtureId: items._id}).count();
                let totalHomeWin = await voteModel.find({fixtureId: items._id, 'vottingFor.home': 1}).count();        
                let totalAwayWin = await voteModel.find({fixtureId: items._id, 'vottingFor.away': 1}).count();
                let totalDrawWin = await voteModel.find({fixtureId: items._id, 'vottingFor.home': 0, 'vottingFor.away': 0}).count();
                items.totalVote  = totalVote;
                items.match      = {
                    league: {
                        name: fixtureDetails.league.name
                    },
                    fixture: {
                        id: fixtureDetails.fixture.id,
                        date: fixtureDetails.fixture.date,
                        timestamp: fixtureDetails.fixture.timestamp,
                        status: fixtureDetails.fixture.status.short,
                    },
                    temas: {
                        home: {
                            name: fixtureDetails.teams.home.name,
                            logo: fixtureDetails.teams.home.logo,
                        },
                        away: {
                            name: fixtureDetails.teams.away.name,
                            logo: fixtureDetails.teams.away.logo,
                        }
                    },
                },
                items.voteInPercentage = {
                    home: ((totalHomeWin/totalVote)*100).toFixed(2) + '%',
                    away: ((totalAwayWin/totalVote)*100).toFixed(2) + '%',
                    draw: ((totalDrawWin/totalVote)*100).toFixed(2) + '%',
                };

                return items;
            }          
          
           
        })) 

        return res.status(200).json({
            success: true,
            data: myMatchData.filter(function(x) { return x != null })
        })

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

module.exports = {
    createVote: createVote,
    getFixtureDetails: getFixtureDetails,
    getMyvoteDetails: getMyvoteDetails,
    getAllvoteDetails: getAllvoteDetails
}