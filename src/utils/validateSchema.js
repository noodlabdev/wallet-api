// validate request data
const validateSchema = (payload, schema) => {
  const { value, error } = schema
    // .prefs({ errors: { label: 'key' } })
    .validate(payload, {
      abortEarly: false,
    });
  // let errors;
  // if (error?.details?.length) {
  //   errors = error.details.map((i) => ({ [i.context.key]: i.message }));
  // }

  return {
    isValid: !error,
    value,
    error,
  };
};

module.exports = validateSchema;
