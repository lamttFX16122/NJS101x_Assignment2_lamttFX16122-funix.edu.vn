const express = require('express');
const { body } = require('express-validator');
const _auth = require('../controllers/auth.controller');
const route = express.Router();

route.get('/login', _auth.getLogin);

route.post('/login', [
    body('email', 'Email không hợp lệ!').isEmail().trim()
], _auth.postLogin);

route.get('/logout', _auth.postLogout);
module.exports = route;