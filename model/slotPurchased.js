const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlotPurchasedSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    slotId: {
        type: Number,
        required: true
    },
    checked: {
        type: Number,
        default : 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    txHash: { type: String, required: true,},
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
});

SlotPurchasedSchema.index(
    { user: 1, slotId : 1, txHash: 1 },
    { unique: true }
  );

const SlotPurchased = mongoose.model('SlotPurchased', SlotPurchasedSchema);

// module.exports = SlotPurchased;
