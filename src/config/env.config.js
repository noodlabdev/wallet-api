const Joi = require('joi');
const { validateSchema } = require('../utils');

const envSchema = Joi.object({
  MONGO_URI: Joi.string().required(),
  PASSPORT_SECRET_OR_KEY: Joi.string().min(1).required(),
  SECRET_KEY: Joi.string().required(),
  SECRET_KEY_IV: Joi.string().required(),
}).unknown();

const {
  isValid,
  value: envVars,
  errors,
} = validateSchema(process.env, envSchema);

if (!isValid) {
  console.log(errors); // eslint-disable-line no-console
  throw new Error('ENV_CONFIG_ERROR');
}

exports.MONGO_URI = envVars.MONGO_URI;
exports.PASSPORT_SECRET_OR_KEY = envVars.PASSPORT_SECRET_OR_KEY;
exports.SECRET_KEY = envVars.SECRET_KEY;
exports.SECRET_KEY_IV = envVars.SECRET_KEY_IV;
