const LeagueFavoriteModule = require("./favorite.service");
const { auth } = require("../../auth/jwt_token");
const resultModule = require('./../Leagues/result.service');
const mongoose = require('mongoose');


const addLeagueFavorite = async (req, res) => {
    const body = req.body;
    try {
        const authData = await auth(req.token_code);

        const isExist = await LeagueFavoriteModule.find({ userId: new mongoose.Types.ObjectId(authData.result._id), leagueId: parseInt(body.leagueId) }).count();

        if (isExist == 0) {
            const favModel = new LeagueFavoriteModule({
                userId: new mongoose.Types.ObjectId(authData.result._id),
                leagueId: parseInt(body.leagueId)
            })
            const favData = await favModel.save();
            return res.status(200).json({
                success: true,
                message: "Add favorite successfully!!"
            })
        } else {
            const blog = await LeagueFavoriteModule.findOneAndDelete({
                userId: new mongoose.Types.ObjectId(authData.result._id),
                leagueId: parseInt(body.leagueId)
            })
            return res.status(200).json({
                success: true,
                message: "Unfavorite successfully!!"
            })
        }

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const getLeagueFavorite = async (req, res) => {
    try {
        const countryArray = ['Australia', 'Austria', 'Argentina', 'Angola', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Europe', 'France', 'Germany', 'Greece', 'Israel', 'Italy', 'India', 'Mexico', 'Malta', 'Nigeria', 'Netherlands', 'Scotland', 'Serbia', 'South America', 'Spain', 'Switzerland', 'Turkey', 'Portugal', 'Romania', 'Russia', 'Ukraine', 'United Kingdom', 'USA', 'World'];
        const authData = await auth(req.token_code);    
        const favList = await LeagueFavoriteModule.find({userId: new mongoose.Types.ObjectId(authData.result._id)});
     
        const result = await Promise.all(favList.map(async (items)=>{
            var matchQuery = {
                'league.country': { $in: countryArray },
                'league.id': items.leagueId
            }
            const liveRecords = await resultModule.aggregate([
                { $match: matchQuery },
                {
                  $group: {
                    "_id": {
                      "country": "$league.country",
                      "league": "$league.name",
                      "flag": "$league.flag",
                      "leagueId": "$league.id"
                    },
                    "matches": {
                      "$push": {
                        id: "$fixture.id",
                        time: "$fixture.timestamp",
                        timeZone: "$fixture.timezone",
                        date: "$fixture.date",
                        result: {$cond: [
                          { "$eq": [ "$teams.home.winner", true ] }, 
                          'Home Win',
                          { "$cond": [
                            { "$eq": ["$teams.away.winner", true ] },
                            "Away Win", 
                            null
                          ]}
                       ]},
                        status: "$fixture.status.long",
                        status_short: "$fixture.status.short",
                        home: {
                          teamName: "$teams.home.name",
                          logo: "$teams.home.logo"
                        },
                        away: {
                          teamName: "$teams.away.name",
                          logo: "$teams.away.logo"
                        }
                      }
                    }
                  }
                },
                {
                  $sort:{"_id.country": 1, 'matches.id': 1}
                },
                {
                  $project: {
                    _id: 0,
                    matches: 1,
                    countryName: "$_id.country",
                    leagueName: "$_id.league",
                    flag: "$_id.flag",
                   leagueId: "$_id.leagueId"
                  }
                }
              ]);
              return liveRecords[0];
        }))
        
        return res.status(200).json({
            success: true,
            data: result.filter(function(x) { return x != null })
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
    addLeagueFavorite: addLeagueFavorite,
    getLeagueFavorite: getLeagueFavorite
}
