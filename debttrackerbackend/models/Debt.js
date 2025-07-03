const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  lender: String,
  borrower: String,
  amount: Number,
  reason: String,
  time: { type: Date, default: Date.now },
  paidRequest: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Debt', debtSchema);
