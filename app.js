// Load the dotfiles.
require('dotenv').load();

const port = process.env.PORT || 3000;
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
const sessionSecret = process.env.SESSION_SECRET || 'this is really secure';
const clientId = process.env.OAUTH2_PROXY_CLIENT_ID || 'we need a client id';
const clientSecret = process.env.OAUTH2_PROXY_CLIENT_SECRET || 'and a client secret too';
const rootRedirect = process.env.ROOT_REDIRECT || 'https://google.com';
const apiToken = process.env.API_TOKEN || '1234567890abcdefghijklmnopqrstuvwxyz';
const allowedUsers = process.env.ALLOWED_USERS
  ? process.env.ALLOWED_USERS.split(',')
  : undefined;

// Includes
const express = require('express');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const Redis = require('ioredis');
const passport = require('passport');
const favicon = require('serve-favicon');
const RedisStore = require('connect-redis')(expressSession);
const authentication = require('./authentication');

// Initialize auth
authentication(passport, clientId, clientSecret, allowedUsers);

// Connect to Redis
const redis = new Redis(redisUrl);

// Initialize the app
const app = express();
const redisSessionStore = new RedisStore({ client: redis });
app.set('views', './views');
app.set('view engine', 'pug');
app.use(favicon('./public/assets/favicon.png'));
app.use(cookieParser());
app.use(
  expressSession({
    store: redisSessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Initialize controllers
const frontendController = require('./controllers/admin/FrontendController')(
  redis,
  passport,
);
const apiController = require('./controllers/admin/APIController')(
  redis,
  apiToken,
);
const redirectController = require('./controllers/RedirectController')(redis);

// Initialize routes
const admin = require('./routes/admin.js')(frontendController, apiController);

app.use('/admin', admin);
const main = require('./routes/main.js')(rootRedirect, redirectController);

app.use('/', main);
app.use((req, res) => {
  res.status(404).render('404');
});

// Start the server
console.log('Connecting to redis...');
redis.ping((err) => {
  if (!err) {
    console.log(`Connection successful. Server listening on port ${port}`);
    app.listen(port);
  }
});
