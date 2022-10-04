const Joi = require('joi');
const { validateSchema } = require('../utils');

const envSchema = Joi.object({
  MONGO_URI: Joi.string().required(),
  PASSPORT_SECRET_OR_KEY: Joi.string().min(1).required(),
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

module.exports = {
  MONGO_URI: envVars.MONGO_URI,
  PASSPORT_SECRET_OR_KEY: envVars.PASSPORT_SECRET_OR_KEY,
};
