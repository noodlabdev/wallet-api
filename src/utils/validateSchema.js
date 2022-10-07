// validate request data
const validateSchema = (payload, schema) => {
  const { value, error } = schema.validate(payload, {
    abortEarly: false,
  });
  return {
    isValid: !error,
    value,
    error,
  };
};

module.exports = validateSchema;
