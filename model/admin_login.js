const mongoose = require("mongoose");

const admin = new mongoose.Schema(
  {
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    status: {
      type: Number,
      default: 0,
    },
     secret :{
      type: String,
      default:''
    }
  },
 
  { timestamps: true, collection: "admin_login" }
);

// module.exports = mongoose.model("admin_login", admin);