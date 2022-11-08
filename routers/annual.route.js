const express = require('express');
const isAuth = require('../Middleware/is-auth');
const _Annual = require('../controllers/annual.controller');
const route = express.Router();

//Get Annul
route.get('/annual', isAuth.isUser, _Annual.getAnnual);
//Dang ky nghi
route.post('/reg-Annual', isAuth.isUser, _Annual.postRegAnnual);
//TEST
route.get('/test', isAuth.isUser, _Annual.getTest)
module.exports = route;