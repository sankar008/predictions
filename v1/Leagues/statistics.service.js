const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    fixtureId: {type: Number, require: [true, "Fixture is a required field"]},
    team: {type: Object, require: [true, "team is a required field"]},
    statistics: {type: Object, require: [true, "statistics is a required field"]},
}, {timestamps: true})

module.exports = mongoose.model('Statistics', statisticsSchema);