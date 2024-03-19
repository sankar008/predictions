const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const favoriteModule = require("./../Favorite/favorite.service");

require("dotenv").config();
const FCM = require('fcm-node');
initializeApp({
    credential: applicationDefault(),
    projectId: "predictions-49181",
});

const sendNotification = async (req, res) => {
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
                $sort:{"_id": -1}
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

        console.log(favorite);
        return false;

      const message = {
        notification: {
          title: "Test Notification",
          body: "This is notification for testing purpose",
        },
        token: "AAAAKKfejwc:APA91bEcJbkomSdh8YsJwAcVeyEYgz6nRpp-dWjgIZsJujbKMM9uJM2pLcNn41kHFrj36ejXEieLow31ZmK7a8LtFQHpQ4s3LrlxNGtGgP9YzZm_TDc04E_GaR7butch2Gt2cHCN33Ct",
      };
  
      getMessaging()
        .send(message)
        .then((response) => {
          res.status(200).json({
            success: true,
            message: "notification sent successfully",
            token,
          });
          console.log(".....................success.................", response);
        })
        .catch((error) => {
            console.log("sendNotificationCatchBlockError", error);
        });
    } catch (error) {
      console.log("sendNotificationCatchBlockError", error);    
    }
};


module.exports = {
    sendNotification: sendNotification
}