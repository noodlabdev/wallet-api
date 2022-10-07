const passportJwt = require('passport-jwt');

const envVars = require('./env.config');
const { Wallet } = require('../accounts/models');

const { Strategy, ExtractJwt } = passportJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: envVars.PASSPORT_SECRET_OR_KEY,
};

const passportConfig = (passport) => {
  passport.use(
    new Strategy(opts, (jwtPayload, done) => {
      // eslint-disable-next-line no-underscore-dangle
      Wallet.findOne({ _id: jwtPayload.walletId }, (err, wallet) => {
        if (err) return done(err, false);
        if (wallet) return done(null, wallet);
        return done(null, false);
      });
    }),
  );
  passport.serializeUser((wallet, done) => {
    done(null, wallet._id); // eslint-disable-line no-underscore-dangle
  });
  passport.deserializeUser((id, done) => {
    Wallet.findById(id, (err, user) => {
      done(err, wallet);
    });
  });
};

module.exports = passportConfig;
