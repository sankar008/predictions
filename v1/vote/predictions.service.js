const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    fixtureId: {type: Number, require: [true, "Fixture id is a required field"]},
    predictions: {type: JSON, require: [true, "Predictions is a required field"]},
    league: {type: JSON, require: [true, "League is a required field"]},
    teams: {type: JSON, require: [true, "teams is a required field"]},
    comparison: {type: JSON, require: [true, "comparison is a required field"]},
    h2h: {type: Array},
}, {timestamps: true})

module.exports = mongoose.model('predictions', predictionSchema);