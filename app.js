/* == Require Lib==*/
const express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const path = require('path');
const moment = require('moment');
const { utc } = require('moment');
const { ISO_8601 } = require('moment');
/* == End Require Lib==*/

/* == Import==*/
/* == End Import==*/

/* == Param==*/
const app = express();
//db config
const _DB_URL = 'mongodb+srv://thanhlam:thanhlam@cluster0.hatavqh.mongodb.net/NJS101x_Assignment2?retryWrites=true&w=majority';

/* == End Param==*/

/* == App Set==*/
app.set('view engine', 'ejs');
app.set('view', 'views');
/* == End App Set==*/

/* == App Use==*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* == End App Use==*/

/* == DB Connect==*/
Mongoose.connect(_DB_URL)
    .then(connect => {
        console.log('Connected...');
        app.listen(3002);
    })
    .catch(err => console.log(err));
/* == End DB Connect==*/