const express = require('express');
const csrf = require('csurf');
const bodyParser = require('body-parser');

module.exports = (frontend, api) => {
  const apiRouter = express.Router();
  apiRouter.use(bodyParser.json());
  apiRouter.get('/', api.authenticate, api.getAllRedirects);
  apiRouter.post('/create', api.authenticate, api.createRedirect);
  apiRouter.post('/delete', api.authenticate, api.deleteRedirect);

  const csrfProtection = csrf({ cookie: true });
  const frontendRouter = express.Router();
  frontendRouter.use(bodyParser.urlencoded({ extended: false }));
  frontendRouter.get('/', frontend.showLogin);
  frontendRouter.post('/login', frontend.login);
  frontendRouter.get('/login/callback', frontend.loginCallback);
  frontendRouter.get('/logout', frontend.logout);
  frontendRouter.get(
    '/redirects',
    csrfProtection,
    frontend.authenticate,
    frontend.getAllRedirects,
  );
  frontendRouter.post(
    '/redirect/create',
    csrfProtection,
    frontend.authenticate,
    frontend.createRedirect,
  );
  frontendRouter.post(
    '/redirect/delete',
    csrfProtection,
    frontend.authenticate,
    frontend.deleteRedirect,
  );

  const router = express.Router();
  router.use('/api', apiRouter);
  router.use('/', frontendRouter);
  router.get('*', (req, res) => {
    res.redirect('/admin');
  });

  return router;
};
