const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const levelStakeSchema = new Schema({
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  percent: {
    type: Number
  },
  income_type: {
    type: String
  },
  income_status: {
    type: String,
    default: "Credit"
  },
  txHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const levelStake = mongoose.model('levelStake', levelStakeSchema);

// module.exports = levelStake;
