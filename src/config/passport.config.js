const passportJwt = require('passport-jwt');

const envVars = require('./env.config');
const User = require('../users/user.model');

const { Strategy, ExtractJwt } = passportJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: envVars.PASSPORT_SECRET_OR_KEY,
};

const passportConfig = (passport) => {
  passport.use(
    new Strategy(opts, (jwtPayload, done) => {
      // eslint-disable-next-line no-underscore-dangle
      User.findOne({ _id: jwtPayload._id }, (err, user) => {
        if (err) return done(err, false);

        if (user) return done(null, user);

        return done(null, false);
      });
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user._id); // eslint-disable-line no-underscore-dangle
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

module.exports = passportConfig;
