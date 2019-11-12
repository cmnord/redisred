const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = (passport, clientId, clientSecret, allowedUsers) => {
  passport.serializeUser((username, done) => {
    done(null, username);
  });

  passport.deserializeUser((username, done) => {
    done(null, username);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: '/admin/login/callback',
      },
      ((accessToken, refreshToken, profile, done) => {
        if (
          allowedUsers !== undefined
          && allowedUsers.indexOf(profile.id) === -1
        ) {
          return done(null, false);
        }
        return done(null, profile);
      }),
    ),
  );
};
