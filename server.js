const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

let expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000);

const session = require('express-session');
let sess = {
    secret: 'cardinal advising',
    name: 'cardinal_platform',
    cookie: {
        secure: false,
        httpOnly: true,
    },
    resave: true,
    saveUninitialized: true};

if (process.env.CARDINAL_PLATFORM_ENV_NAME === 'aws_production') {
    sess.cookie.secure = true;
    sess.cookie.domain = 'app.cardinal.coach';
}


app.use(session(sess));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// configure a public directory to host static content
app.use(express.static(__dirname + '/public'));

require ("./cardinal.platform.js")(app);

let port = process.env.PORT || 3001;

app.listen(port);
