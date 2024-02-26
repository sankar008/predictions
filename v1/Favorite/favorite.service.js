const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    fixtureId: {type: Number, require: [true, "Fixture id is a required field"]},
    userId: {type: mongoose.Types.ObjectId, require: [true, "User id is a required field"]},
}, {timestamps: true})

module.exports = mongoose.model('Favorites', favoriteSchema);