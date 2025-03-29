const mongoose = require("mongoose");

const signUp = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: { unique: true },
    },
    name: { type: String, required: true },
    wallet_add: { type: String, unique: true, required: true },
    referrerId: { type: String, required: true },
    phone: { type: Number, required: true },
    directCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "signup" }
);
// module.exports = mongoose.model("signup", signUp);