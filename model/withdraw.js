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
  txHash : {
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
withdrawalSchema.index(
  { user: 1, weeklyReward: 1, nonce: 1, txHash: 1 },
  { unique: true }
);

const WithdrawalModel = mongoose.model('Withdraw', withdrawalSchema);

module.exports = WithdrawalModel;