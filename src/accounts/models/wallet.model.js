const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
  mnemonic: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  currentPath: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

module.exports = mongoose.model('wallets', walletSchema);
