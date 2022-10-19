// validate request data
const validateSchema = (payload, schema) => {
  const { value, error } = schema.validate(payload, {
    abortEarly: false,
  });
  return {
    isValid: !error,
    value,
    error: error?.details.map((e) => e.message),
  };
};

module.exports = validateSchema;
