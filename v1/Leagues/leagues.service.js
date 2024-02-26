const mongoose = require('mongoose');

const leaguesSchema = new mongoose.Schema({
    league: {type: Object, require: [true, "Leagues is a required field"]},
    country: {type: Object, require: [true, "Country is a required field"]},
    seasons: {type: Array, require: [true, "Seasons is a required field"]}
}, {timestamps: true})

module.exports = mongoose.model('Leagues', leaguesSchema);