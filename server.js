const dotenv = require('dotenv');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');



dotenv.load();

var app = express();

app.use(express.cookieParser('yoursecrethere'));
app.use(express.session());
// const { Role } = require('./models/Role.entity');

//adminJS Builder

  // Passing resources by giving entire database
  // adminJs = new AdminJS({
  //   databases: [mongooseDb],
  //   resources: [Role],
  //   //... other AdminJSOptions
  // })

  // Passing resources one by one,
  // also with an additional options for admin resource
  // adminJs = new AdminJS({
  //   resources: [User, {
  //     resource: Admin,
  //     options: {
  //       //...
  //     },
  //   }],
  // })



// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const host = process.env.HOST;
const config = {
  authRequired: false,
  auth0Logout: true,
  clientSecret: process.env.CLIENTSECRET,
  authorizationParams: {
    response_type: 'code',
    audience: `${host}:5000`,
    // audience: `http://143.244.150.6:5000`,
    scope: 'openid profile email'
  }
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `${host}:${port}`;
}

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });å
});



module.exports = app;
