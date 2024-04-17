const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, require: [true, 'User id is a required field'] },
    activeDate: { type: Date, require: [true, 'Active date a required field'] },
    expiryDate: { type: Date, require: [true, 'Expiry date is a required field'] },
    activeSubscriptions: { type: String, require: [true, 'Active Subscription is a required field'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriptions', subscriptionSchema);
