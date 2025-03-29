const mongoose = require('mongoose');

// Define a schema
const openlevelSchema = new mongoose.Schema({
  user: { type: String },
  month: { type: Number, default : 0 },
  level: { type: Number, default : 0 },
  txn_id : { type: String },
  startDate: {
    type: Date
  },
  endDate : {
    type: Date,
  }
});

// Create a model
const openlevel = mongoose.model('openlevel', openlevelSchema);

// module.exports = openlevel;
