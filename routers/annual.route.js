const express = require('express');
const isAuth = require('../Middleware/is-auth');
const _Annual = require('../controllers/annual.controller');
const route = express.Router();

//Get Annul
route.get('/annual', isAuth.isUser, _Annual.getAnnual);
//Dang ky nghi
route.post('/reg-Annual', isAuth.isUser, _Annual.postRegAnnual);

//Sua ky nghi
route.post('/edit-Annual', isAuth.isUser, _Annual.postEditAnnual);

//Sua ky nghi
route.post('/remove-annual', isAuth.isUser, _Annual.removeAnnual);

//TEST
route.get('/test', isAuth.isUser, _Annual.getTest)
module.exports = route;