const express = require('express')
const app     =  express();
const httpServer = require('http').createServer(app);
require('dotenv').config();
const cors = require('cors')
const mongodb = require('./db');
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));
const port    = 8080 //process.env.PORT;
const userRouter = require('./v1/User/user.route');
const leaguesRouter = require('./v1/Leagues/leagues.route');
const favRouter = require('./v1/Favorite/favorite.route');
const contactRouter = require('./v1/contactus/contact.route');
const voteRouter = require('./v1/vote/vote.route');
const leagueFavRouter  = require('./v1/League_Fav/favorite.route');
const multer = require("multer");
const path = require('path');

const imageStorage = multer.diskStorage({ 
    destination: 'images', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 90000000
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|pdf|doc)$/)) { 
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
})

app.use("/v1/user", imageUpload.single('image'), userRouter);
app.use("/v1/leagues", leaguesRouter);
app.use("/v1/leagues-fav", leagueFavRouter);
app.use("/v1/fav", favRouter);
app.use("/v1/contact", contactRouter);
app.use("/v1/vote", voteRouter);

httpServer.listen(port, ()=>{
    console.log(`Server runging with port ${port}`);
});