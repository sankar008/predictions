const favoriteModule = require("./favorite.service");
const { auth } = require("../../auth/jwt_token");
const mongoose = require('mongoose');


const addFavorite = async (req, res) => {
    const body = req.body;
    try {
        const authData = await auth(req.token_code);


        const isExist = await favoriteModule.find({ userId: new mongoose.Types.ObjectId(authData.result._id), fixtureId: parseInt(body.fixtureId) }).count();

        if (isExist == 0) {
            const favModel = new favoriteModule({
                userId: new mongoose.Types.ObjectId(authData.result._id),
                fixtureId: parseInt(body.fixtureId)
            })
            const favData = await favModel.save();
            return res.status(200).json({
                success: true,
                message: "Add favorite successfully!!"
            })
        } else {
            const blog = await favoriteModule.findOneAndDelete({
                userId: new mongoose.Types.ObjectId(authData.result._id),
                fixtureId: parseInt(body.fixtureId)
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

const getFavorite = async (req, res) => {
    try {
        const authData = await auth(req.token_code);
        const favorite = await favoriteModule.aggregate([
            {
                $lookup: {
                    from: "results",
                    localField: "fixtureId",
                    foreignField: "fixture.id",
                    as: "match"
                }
            },
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(authData.result._id)
                }
            },
            {
                $project: {
                    "match.league.name": 1,
                    "match.fixture.timestamp": 1,
                    "match.fixture.id": 1,
                    "match.teams": 1,
                    "match.goals": 1,
                    "match.score": 1,
                }
            }
        ])
        return res.status(200).json({
            success: true,
            message: favorite
        })

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }


    console.log(blog);
}

module.exports = {
    addFavorite: addFavorite,
    getFavorite: getFavorite
}