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
var server = http.createServer(app)

var io       = require('socket.io')(server,{
	cors: {
			origin: "http://localhost",
			methods: ["GET", "POST"],
			credentials: true,
			transports: ['websocket', 'polling'],
	},
	allowEIO3: true
	}) 
  // app.set("io",io);

  global.io = io

// app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// const session = require('express-session');	//To Acquire it

// app.use(session({ 		//Usuage
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));

router.use(function(req,res,next){
	req.io = io;
	next();
});


app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const port = process.env.PORT || 3000;
const host = process.env.HOST;
const config = {
  authRequired: false,
  auth0Logout: true,
  clientSecret: process.env.CLIENTSECRET,
  secret: 'LONG_RANDOM_STRING',
  baseURL: `${host}:${port}`,
  clientID: process.env.CLIENTID,
  authorizationParams: {
    response_type: 'code',
    audience: `${host}:5000`,
    // audience: `http://143.244.150.6:5000`,
    scope: 'openid profile email'
  }
};

// const port = process.env.PORT || 3000;
// if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
//   config.baseURL = `${host}:${port}`;
// }

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
  });
});


// io.on('connection', function (socket) {
//   console.log("rs1:",datas);
//   socket.emit('vote', datas);


// });

server.listen(port);

module.exports = app, server, io;
