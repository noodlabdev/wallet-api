const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'wallets' },
  address: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  decimals: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

module.exports = mongoose.model('tokens', tokenSchema);
