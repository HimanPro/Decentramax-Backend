const mongoose = require("mongoose");
const { Schema } = mongoose;

const confiigSchema = new Schema(
  {
      lastSyncBlock: { type:  Number,required: true },
      updatedAt: {
        type: Date,
        default: Date.now,
      }
  }
);

const confiig = mongoose.model("confiig", confiigSchema);

module.exports = confiig;