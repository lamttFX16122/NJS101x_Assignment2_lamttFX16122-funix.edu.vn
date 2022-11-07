/* == Require Lib==*/
const express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const path = require('path');
const moment = require('moment');
const multer = require('multer');
const session = require('express-session');
const mongoDbSession = require('connect-mongodb-session')(session);
/* == End Require Lib==*/

/* == Import==*/
const routeAuth = require('./routers/auth.route');
const routeUser = require('./routers/user.route');
const routeTimeRecording = require('./routers/timeRecording.route');
const _User = require('./models/user.model');
/* == End Import==*/

/* == Param==*/
const app = express();
//db config
const _DB_URL = 'mongodb+srv://thanhlam:thanhlam@cluster0.hatavqh.mongodb.net/NJS101x_Assignment2?retryWrites=true&w=majority';

const store = new mongoDbSession({
    uri: _DB_URL,
    collection: 'sessions'
});
const fileStore = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFill = (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
    /* == End Param==*/

/* == App Set==*/
app.set('view engine', 'ejs');
app.set('views', 'views');
/* == End App Set==*/

/* == App Use==*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStore, fileFilter: fileFill }).single('image'));

//Session
app.use(session({
    secret: 'My Secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

//Route
app.use(routeAuth);
app.use(routeUser);
app.use(routeTimeRecording);


app.use((req, res, next) => {
        if (!req.session.user) {
            return next();
        }
        _User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return next();
                }
                req.user = user;
                next();
            }).catch(err => {
                throw new Error(err);
            });
    })
    /* == End App Use==*/

/* == DB Connect==*/
Mongoose.connect(_DB_URL)
    .then(connect => {
        console.log('Connected...');
        app.listen(3002);
    })
    .catch(err => console.log(err));
/* == End DB Connect==*/