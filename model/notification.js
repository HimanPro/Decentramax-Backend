const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
      user: { type:  String,required: true },
      notify_type: { type:  String,required: true },
      criteria : { type:  Number,default: 0 },
      message : { type:  String,required: true },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }
  }
);

// Create indexes for unique fields
// userSchema.index({ mobileNumber: 1, 'documents.pan.number': 1 });
const notification = mongoose.model("notification", notificationSchema);

// module.exports = notification;