const redirectModel = require('../../models/Redirect');

module.exports = (redis, passport) => {
  const Redirect = redirectModel(redis);
  const FrontendController = {};

  // Authentication stuff...
  FrontendController.authenticate = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect('/admin');
  };

  FrontendController.showLogin = (req, res) => {
    if (req.isAuthenticated()) res.redirect('/admin/redirects');
    else res.render('admin/root');
  };

  FrontendController.login = passport.authenticate('google', {
    scope: ['profile'],
  });

  FrontendController.loginCallback = passport.authenticate('google', {
    successRedirect: '/admin/redirects',
    failureRedirect: '/admin#incorrect',
  });

  FrontendController.logout = (req, res) => {
    req.session.destroy(() => {
      res.redirect('/admin');
    });
  };

  // Actual display logic
  FrontendController.getAllRedirects = (req, res) => {
    Redirect.getAll((err, redirects) => {
      if (err) res.status(500).send(err);
      else {
        res
          .status(200)
          .render('admin/redirects', {
            redirects,
            token: req.csrfToken(),
          });
      }
    });
  };

  FrontendController.createRedirect = (req, res) => {
    const { key } = req.body;
    const { url } = req.body;
    if (!key || !url) {
      res.status(400).send('You failed to supply all of the parameters.');
      return;
    }
    Redirect.create(key, url, (err) => {
      if (err) res.status(500).send(err);
      else res.redirect('/admin/redirects');
    });
  };

  FrontendController.deleteRedirect = (req, res) => {
    const { key } = req.body;
    if (!key) {
      res.status(400).send('You failed to supply all of the parameters.');
      return;
    }
    Redirect.delete(key, (err) => {
      if (err) res.status(500).send(err);
      else res.redirect('/admin/redirects');
    });
  };

  return FrontendController;
};
