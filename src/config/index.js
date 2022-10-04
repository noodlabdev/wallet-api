const connectDb = require('./mongoose.config');
const configPassport = require('./passport.config');
const envVars = require('./env.config');

module.exports = {
  connectDb,
  configPassport,
  envVars,
};
