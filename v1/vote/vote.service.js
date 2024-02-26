const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    fixtureId: {type: Number, require: [true, "Fixture id is a required field"]},
    userId: {type: mongoose.Types.ObjectId, require: [true, "User id is a required field"]},
    vottingFor: {type: JSON, require: [true, "Vote is a required field"]}
}, {timestamps: true})

module.exports = mongoose.model('Votes', voteSchema);