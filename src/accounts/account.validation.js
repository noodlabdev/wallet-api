const Joi = require('joi');

const loginSchema = Joi.object({
  mnemonic: Joi.string()
    .regex(/^\s*\S+(?:\s+\S+){4,}\s*$/)
    .required(),
});

module.exports = {
  loginSchema,
};
