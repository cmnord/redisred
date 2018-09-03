var GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport, clientId, clientSecret, allowedUsers) {
  passport.serializeUser(function(username, done) {
    done(null, username);
  });

  passport.deserializeUser(function(username, done) {
    done(null, username);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: '/admin/login/callback'
      },
      function(accessToken, refreshToken, profile, done) {
        if (
          allowedUsers !== undefined &&
          allowedUsers.indexOf(profile.id) == -1
        ) {
          return done(null, false);
        }
        return done(null, profile);
      }
    )
  );
};
