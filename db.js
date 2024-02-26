var mongoose = require("mongoose");
require('dotenv').config()
var MONGODB_URL = process.env.MONGOODB_LINK;
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	if(process.env.ENV_MODE != "test") {
		console.log("Database connected");
	}
})
.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
});
var db = mongoose.connection; 
