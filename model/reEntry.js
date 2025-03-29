const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reEntrySchema = new Schema({
    user: {
        type: String,
        required: true
    },
    level: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    txHash: { type: String, required: true, },
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
});

reEntrySchema.index(
    { user: 1, level :1, txHash: 1 },
    { unique: true }
  );

const reEntry = mongoose.model('ReEntry', reEntrySchema);

module.exports = reEntry;
