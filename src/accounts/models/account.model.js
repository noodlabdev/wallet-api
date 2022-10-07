const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'wallets' },
  address: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },
  keystore: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

module.exports = mongoose.model('accounts', accountSchema);
