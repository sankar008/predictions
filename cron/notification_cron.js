const cron = require('node-cron');
const FCM = require('fcm-node');
const userModel = require("./../v1/User/user.service");
const favoriteModule = require("./../v1/Favorite/favorite.service");
const moment = require('moment');

const mongodb = require('./../db');

cron.schedule('* * * * *', async function () {
    try {
        let todayDate = moment().format('YYYY-MM-DD');
        let nextDate = moment().add(1, 'days').format("YYYY-MM-DD");

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
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind : "$user" },
            { $unwind : "$match" }, 
            {
                $match: {
                    'match.fixture.date': { $gte: todayDate, $lte: nextDate }
                }
            },
            {
                $sort: { "_id": -1 }
            },
            {
                $project: {
                    "match": 1,
                    "user": 1
                }
            }
        ]);      


        favorite.map( async (items) => {          
            const fcm = new FCM(process.env.FIREBASE_TOKEN);
            let currentTime = new Date();
            let expireTime = new Date(items.match.fixture.date);
            let minutes = (expireTime - currentTime) / (1000 * 60);
            if (Math.ceil(minutes) == 30) {
                const message = {
                    notification: {
                        'title': items.match.teams.home.name + ' V/S ' + items.match.teams.away.name + ' starts in 30 minutes',
                        'body': 'Make sure you are all set!'
                    },
                    registration_ids: [items.user.fcm_token],
                };

                const messaging = fcm.send(message, function (err, response) {
                    console.log(err);
                    console.log(response);
                })
            }
        })


    } catch (error) {
        console.log('error in processing data ', error);
    }
});

