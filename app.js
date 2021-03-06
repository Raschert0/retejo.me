var chalk = require('chalk');
var commander = require('commander');
var express = require('express');
var fetch = require('node-fetch');
var hbs = require('hbs');

// session-related things
var session = require('express-session');
var sessionStore = require('express-nedb-session')(session);

// use the api routes and the i18n handler
var api = require('./api');
var i18n = require('./i18n');
//console.log(i18n);

var app = express();

// the secret will be process.env.COOKIE_SECRET
// but for now, we're just gonna use a test one
app.use(session({
    secret: "bananasaregreat",
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 365 * 24 * 3600 * 1000 // a week long session
    },
    store: new sessionStore({ filename: 'sessiondb' })
}));

// ensure that a language is set for every session
app.use(function(req, res, next) {
    var language = req.session.language;

    if (language == {} || typeof language === "undefined") {
        language = req.session.language = i18n.defaultLanguage;
    }

    next();
});

app.use('/api', api); // make sure the api routes are hooked up and working at /api

// ensure that handlebars is the view engine on express' end
app.set('view engine', 'hbs');
app.set('views', __dirname + '/v');
hbs.registerPartials(__dirname + '/v/part');

// load the assets into their proper folder so the templates run smoothly
app.use('/js',express.static(__dirname + '/assets/js'));
app.use('/css',express.static(__dirname + '/assets/css'));

// frontend routes
app.get('/', function (req, res) {
    var language = req.session.language;
    language.PG_TITLE = language.PG_HOME;

    if (req.session.user) {
        language.name = req.session.user.username;
    } else {
        language.name = req.ip;
    }

    res.render('home', language);
});

app.get('/login', function (req, res) {
    var language = req.session.language;
    language.PG_TITLE = language.PG_LOGIN;
    res.render('login', language);
});

app.get('/signup', function (req, res) {
    var language = req.session.language;
    language.PG_TITLE = language.PG_SIGNUP;
    res.render('signup', language);
});

module.exports = app;
