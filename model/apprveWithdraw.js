const mongoose = require("mongoose");

const approveWithdraw = mongoose.Schema(
  {
    user: { type: String, required: true },
    amount: { type: Number, required: true },
    wallet_type: { type: String, required: true },
    txHash:{type:String,required:true},
    payment_method:{type:String,required:true },
  },
  { timestamps: true, collection: "approveWithdraw" }
);

// module.exports = mongoose.model("approveWithdraw", approveWithdraw);
