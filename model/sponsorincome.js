const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sponsorIncomeSchema = new Schema({
  sender: {
    type: String,
    required: true, 

  },
  receiver: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

sponsorIncomeSchema.index(
  { sender: 1, receiver: 1, amount: 1, txHash: 1 },
  { unique: true }
);

const SponsorIncome = mongoose.model('SponsorIncome', sponsorIncomeSchema);

// module.exports = SponsorIncome;
