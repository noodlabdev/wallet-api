const Joi = require('joi');
const { CHAIN_ID_SUPPORTED } = require('../web3');

const loginSchema = Joi.object({
  mnemonic: Joi.string()
    .regex(/(?:[\w\']+\s+){11}[\w\']+/, 'mnemonic must be 12 words')
    .required(),
});

const getTokensSchema = Joi.object({
  account: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address')
    .required(),
  chainId: Joi.number()
    .valid(...CHAIN_ID_SUPPORTED)
    .label('Invalid chainId')
    .required(),
});

const addTokenSchema = Joi.object({
  address: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address')
    .required(),
  chainId: Joi.number()
    .valid(...CHAIN_ID_SUPPORTED)
    .label('Invalid chainId'),
});

const sendTransactionSchema = Joi.object({
  token: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address')
    .required(),
  from: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address')
    .required(),
  to: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address')
    .required(),
  amount: Joi.number().required(),
  chainId: Joi.number()
    .valid(...CHAIN_ID_SUPPORTED)
    .label('Invalid chainId'),
});

module.exports = {
  loginSchema,
  getTokensSchema,
  addTokenSchema,
  sendTransactionSchema,
};
