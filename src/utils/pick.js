/**
 *
 * @param {Object} object
 * @param {Array} keys
 */
const pick = (object, keys = []) =>
  keys.reduce((key, acc) => {
    if (object[key]) acc[key] = object[key];
    return acc;
  }, {});

module.exports = pick;
