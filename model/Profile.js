const mongoose = require("mongoose");

const Profile = new mongoose.Schema(
  {
    address: { type: String },
    name: { type: String },
    profileUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileData", Profile);
