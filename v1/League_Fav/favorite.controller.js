const LeagueFavoriteModule = require("./favorite.service");
const { auth } = require("../../auth/jwt_token");
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
   // try {
        const countryArray = ['Australia', 'Austria', 'Argentina', 'Angola', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Europe', 'France', 'Germany', 'Greece', 'Ghana', 'Israel', 'Italy', 'India', 'Mexico', 'Malta', 'Nigeria', 'Netherlands', 'Scotland', 'Serbia', 'South America', 'Spain', 'Switzerland', 'Turkey', 'Portugal', 'Romania', 'Russia', 'Ukraine', 'United Kingdom', 'USA', 'World'];
        const authData = await auth(req.token_code);
        var matchQuery = {
            'results.league.country': { $in: countryArray },
        }

        const favorite = await LeagueFavoriteModule.aggregate([          
            {
                $lookup: {
                    from: "results",
                    localField: "leagueId",
                    foreignField: "league.id",
                    as: "results"
                }
            },          
            // {
            //     $match: matchQuery
            // },
            // {
            //     $group: {
            //         "_id": {
            //             "country": "$league.country.name",
            //             "league": "$league.league.name",
            //             "flag": "$league.country.flag"
            //         },
            //     }
            // },
            // {
            //     $sort:{"_id.country": 1, 'league.id': 1}
            // },
            // {
            //     $project: {
            //       _id: 0,
            //       matches: 1,
            //       countryName: "$_id.country",
            //       leagueName: "$_id.league",
            //       flag: "$_id.flag",
            //     }
            //   }
        ])


        return res.status(200).json({
            success: true,
            data: favorite
        })

    // } catch (e) {
    //     const error = e.errors;
    //     return res.status(400).json({
    //         success: false,
    //         message: error
    //     })
    // }


    console.log(blog);
}

module.exports = {
    addLeagueFavorite: addLeagueFavorite,
    getLeagueFavorite: getLeagueFavorite
}