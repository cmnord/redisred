var express = require('express');
var csrf = require('csurf');

module.exports = function(rootRedirect, frontend, redirectController) {

  var csrfProtection = csrf({ cookie: true });
  var router = express.Router();
  router.get('/', function(req, res) {
  	res.redirect(rootRedirect);
  })
  router.get('/:redirect_name', csrfProtection, frontend.authenticate, redirectController.redirect);
  return router;
};
