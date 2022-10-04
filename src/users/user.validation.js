const Joi = require('joi');

const registerSchema = Joi.object({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(3).required(),
  },

  // email: string.email().trim().lowercase().required().messages({
  //   "string.email": "Not a valid email address.",
  //   "string.empty": "Email is required.",
  // }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
