const moment = require('moment-timezone');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyroiSchema = new Schema({
  stakeid: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  income_status: {
    type: String,
    default: "Credit"
  },
  totalIncome: {
    type: String
  },
  capping: {
    type: String
  },
  level_status : {
    type: String,
    default : 0
  },
  send_status : {
    type: String,
    default : 0
  },
  txHash: { type:  String,required: true },
  insertedAt: {
    type: Date,
    default: () => moment().utcOffset('+05:30').format()
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const dailyroi = mongoose.model('dailyroi', dailyroiSchema);

// module.exports = dailyroi;
