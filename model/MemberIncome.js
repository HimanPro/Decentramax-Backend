const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberIncomeSchama = new Schema({
  user: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // timestamp: { type: Number, required: true },
});

MemberIncomeSchama.index(
  { user: 1, amount: 1, createdAt: 1 },
  { unique: true }
);

const MemberIncome = mongoose.model("MemberIncome", MemberIncomeSchama);

module.exports = MemberIncome;
