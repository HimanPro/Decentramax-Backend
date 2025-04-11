const mongoose = require("mongoose");
const registration = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
  
    },
    uId: { type: Number, required: true },
    rId: { type: Number, required: true },
    user: { type: String, required: true },
    referrerId: { type: String, required: true,trim:true },
    referrer: { type: String, required: true },
    memberIncome: { type: Number, default: 0},

    // rId: { type: Number, default: 0},
    // rank: { type: Number, default: 0 },
    // capping : { type: Number, default: 2 },
    // directCount: { type: Number, default: 0 },
    // directStakeCount: { type: Number, default: 0 },
    // directbusiness: { type: Number, default: 0 },
    // stakedirectbusiness: { type: Number, default: 0 },
    // staketeambusiness: { type: Number, default: 0 },
    // directplusteambiz: { type: Number, default: 0 },
    // return: { type: Number,default : 0 },
    //  invest_amount: { type: Number,default : 0 },
    // current_plan: { type: String,default : null },
    // topup_amount: { type: Number,default : 0 },
    // totalIncome: { type: Number,default : 0 },
    // totalRegIncome: { type: Number,default : 0 },
    // totalWithdraw: { type: Number,default : 0 },
    // totalRegWithdraw: { type: Number,default : 0 },
    // referalIncome: { type: Number,default : 0 },
    // levelRegIncome: { type: Number,default : 0 },
    // levelIncome: { type: Number,default : 0 },
    // roiincome: { type: Number,default : 0 },
    
    // poolIncome: { type: Number,default : 0 },
    //  rank: { type: String, default : null },
    //  ranknumber: { type: Number,default : 0 },
    //  slot_rank: { type: String, default : null },
    //  slot_ranknumber: { type: Number,default : 0 },
    // rankbonus: { type: Number,default : 0 },
    // poolbonus: { type: Number,default : 0 },
    // currentPool : { type: Number, default : 0},
    // wallet_income: {type: Number, default : 0},
    // walletreg_income: {type: Number, default : 0},
    // wallet_rewards: {type: Number, default : 0},
    // wallet_lapse: {type: Number, default : 0},
    // withdraw_status:{type: Number, default : 0},
    txHash: { type: String, required: true },
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    // cal_status:{type:Number,default:0},
    // // slotPurchased : {type : Array, default: []},
    // teamBusinessnew:{type:Number, default:0}
  },
  { timestamps: true, collection: "Registration" }
);

registration.index(
  { user: 1, txHash: 1 },
  { unique: true }
);

// registration.add(
//   mongoose.Schema({
//     memberIncome: { type: Number,default : 0 },
//   })
// )

module.exports = mongoose.model("Registration", registration);