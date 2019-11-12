const redirectModel = require('../../models/Redirect');

const sendJSON = (res, obj, status) => {
  res.status(status || 200);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(obj));
};

module.exports = (redis, apiToken) => {
  const Redirect = redirectModel(redis);
  const APIController = {};

  APIController.authenticate = (req, res, next) => {
    if (req.get('x-access-token') === apiToken) return next();
    return sendJSON(
      res,
      { error: 'You failed to authenticate with the correct token.' },
      403,
    );
  };

  APIController.getAllRedirects = (req, res) => {
    Redirect.getAll((err, redirects) => {
      if (err) res.status(500).send(err);
      else {
        sendJSON(res, redirects);
      }
    });
  };

  APIController.createRedirect = (req, res) => {
    const { key } = req.body;
    const { url } = req.body;
    if (!key || !url) {
      res.status(400).send('You failed to supply all of the parameters.');
      return;
    }
    Redirect.create(key, url, (err, redirect) => {
      if (err) res.status(500).send(err);
      else sendJSON(res, redirect);
    });
  };

  APIController.deleteRedirect = (req, res) => {
    const { key } = req.body;
    if (!key) {
      res.status(400).send('You failed to supply all of the parameters.');
      return;
    }
    Redirect.delete(key, (err) => {
      if (err) res.status(500).send(err);
      else sendJSON(res, {});
    });
  };

  return APIController;
};
