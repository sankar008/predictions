const Subscription = require('./subscription.service');
const User         = require('./../User/user.service')
const { auth } = require('../../auth/jwt_token');
const mongoose = require('mongoose');

const createSubscription = async (req, res) => {
  const body = req.body;
  try {
    const authData = await auth(req.token_code);
    const subscription = new Subscription({
      userId: new mongoose.Types.ObjectId(authData.result._id),
      activeDate: body.activeDate,
      expiryDate: body.expiryDate,
      activeSubscriptions: body.activeSubscriptions
    });

    const subData = await subscription.save();

    const userSubscription = await User.updateOne({ _id:  new mongoose.Types.ObjectId(authData.result._id)}, {
        expiryDate: body.expiryDate
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription added successfully'
    });
  } catch (e) {
    const error = e.errors;
    return res.status(400).json({
      success: false,
      message: error
    });
  }
};

module.exports = {
    createSubscription: createSubscription
}
