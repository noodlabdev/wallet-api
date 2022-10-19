const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  token: {
    address: {
      type: String,
      trim: true,
      required: true,
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
    chainId: {
      type: Number,
      required: true,
    },
  },
  chainId: {
    type: Number,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
  gasPrice: {
    type: String,
    required: true,
  },
  gasLimit: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  v: {
    type: Number,
    required: true,
  },
  r: {
    type: String,
    required: true,
  },
  s: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

module.exports = mongoose.model('transactions', transactionSchema);
