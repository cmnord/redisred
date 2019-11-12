const express = require('express');

module.exports = (rootRedirect, redirectController) => {
  const router = express.Router();
  router.get('/', (req, res) => {
    res.redirect(rootRedirect);
  });
  router.get('/:redirect_name', redirectController.redirect);
  return router;
};
