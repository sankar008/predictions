const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
require("dotenv").config();
const FCM = require('fcm-node');
initializeApp({
    credential: applicationDefault(),
    projectId: "predictions-49181",
});

const sendNotification = (req, res) => {
    try {    
      //const token = req.body.token;
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

sendNotification();

module.exports = {
    sendNotification: sendNotification
}