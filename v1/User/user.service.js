const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    type: {type: String, enum: ['email', 'google', 'apple'], require: [true, "Registration type is a required field"]},
    emailId: {type: String, required: function() { return this.type != 'apple'?true: ''}},
    password: {type: String, required: function() { return this.type == 'email'?true: ''}},
    name: {type: String, required: function() { return this.type == 'email'?true: ''}},
    otp: {type: Number},
    fcm_token: {type: String, required: [true, "Fcm token is a required field"]},
    profile_image: {type: String},
    plan_details: {type: String},    
    isVerified: {type: Number, default: 1},
    isActive: {type: Number, default: 1}
}, {timestamps: true})

module.exports = mongoose.model('Users', userSchema);