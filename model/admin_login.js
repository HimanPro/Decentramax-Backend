const mongoose = require("mongoose");

const AdminCredSchema = new mongoose.Schema(
  {
    email: { type: String, default: 'admin@decentramax.com' },
    password: { type: String, default: 'admin@1987' },
  },
  {
    timestamps: true,
    collection: "AdminCred", // Explicit collection name
  }
);

module.exports = mongoose.model("AdminCred", AdminCredSchema);
