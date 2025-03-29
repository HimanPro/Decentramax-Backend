const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawalSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  weeklyReward: {
    type: Number,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  trxnHash : {
    type: String,
    default : null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timestamp:{
    type: Date,
    default: Date.now
  }
});

const WithdrawalModel = mongoose.model('Withdraw', withdrawalSchema);

module.exports = WithdrawalModel;