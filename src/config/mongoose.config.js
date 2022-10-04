const mongoose = require('mongoose');

const envVars = require('./env.config');

const connectDb = async () => {
  try {
    await mongoose.connect(envVars.MONGO_URI);
    console.log('MongoDB connected'); // eslint-disable-line no-console
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
  }
};

module.exports = connectDb;
