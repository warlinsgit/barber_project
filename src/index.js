//https://github.com/FaztTech/nodejs-mysql-links/blob/master/src/views/profile.hbs

//https://www.youtube.com/watch?v=Xm05wLisaD0

//https://www.js-tutorials.com/nodejs-tutorial/nodejs-tutorial-add-edit-delete-record-using-mysql/

//https://www.tutsmake.com/first-crud-node-express-js-mysql-example/

const express = require('express');
const morgan = require('morgan');
const hbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const validator = require('express-validator');
const MySqlStore = require('express-mysql-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
var url = require('url');

const { database } = require('./keys');

//initializations
const app = express();


require('./lib/passport');

//setting  - server needs

app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', hbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

//Middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.use(session({
  secret: 'barbersession',
  resave: false,
  saveUninitialized: false,
  store: new MySqlStore(database),
  cookie: {maxAge: 180 * 60 * 1000 } // how long the session expire  -
}));


app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());



//Global variables
app.use((req, res, next) => {
app.locals.session = req.session;
app.locals.success = req.flash('success');
app.locals.message = req.flash('message');
app.locals.user = req.user;
  next();
})

//Routes

app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use(require('./routes/booking'));
app.use(require('./routes/customers'));
app.use(require('./routes/staff'));
app.use('/services', require('./routes/services'));





// Public

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));



//Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('error', {
        title: '404 - Page Not Found',
        desc: 'Page Not Found',
        error: 404
    });
});

//Handle 500 - Must have an arity of 4, otherwise express falls back to default error handling
app.use(function(err, req, res, next) {
    res.status(500);
    console.log(err);
    res.render('error', {
        title: '500 - Internal Server Error',
        desc: 'Internal Server Error',
        error: 500
    });
});


//Handle 500 - Must have an arity of 4, otherwise express falls back to default error handling

// Starting the server

app.listen(app.get('port' ),() => {

 console.log('Server on port', app.get('port'));
});
