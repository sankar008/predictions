const mongoose = require('mongoose');
var moment = require('moment');

const resultSchema = new mongoose.Schema({
    fixture: {type: Object, require: [true, "Fixture is a required field"]},
    league: {type: Object, require: [true, "league is a required field"]},
    teams: {type: Object, require: [true, "teams is a required field"]},
    goals: {type: Object, require: [true, "goals is a required field"]},
    score: {type: Object, require: [true, "score is a required field"]},
    events: {type: Array, require: [true, "events is a required field"]},
}, {timestamps: true, toJSON: {virtuals: true, versionKey: false }})

resultSchema.virtual("fixture_date").get(function(){
    return moment(this.fixture.timestamp).format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('Results', resultSchema);