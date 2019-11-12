const redirectModel = require('../models/Redirect');

module.exports = (redis) => {
  const Redirect = redirectModel(redis);
  const RedirectController = {};

  RedirectController.redirect = (req, res) => {
    const redirectName = req.params.redirect_name;
    Redirect.get(redirectName, (err, redirect) => {
      if (err) res.status(500).send(err);
      else if (!redirect) res.status(404).render('404');
      else res.redirect(redirect.url);
    });
  };

  return RedirectController;
};
