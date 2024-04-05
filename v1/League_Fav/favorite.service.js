const mongoose = require('mongoose');

const LeagueFavoriteSchema = new mongoose.Schema({
    leagueId: {type: Number, require: [true, "Fixture id is a required field"]},
    userId: {type: mongoose.Types.ObjectId, require: [true, "User id is a required field"]},
}, {timestamps: true})

module.exports = mongoose.model('League_favs', LeagueFavoriteSchema);