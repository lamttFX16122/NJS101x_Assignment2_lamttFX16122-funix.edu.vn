const express = require('express');
const { check, body } = require('express-validator');
const moment = require('moment');
const _User = require('../controllers/user.controller');
const _UserModel = require('../models/user.model');
const isAuth = require('../Middleware/is-auth');
const route = express.Router();


route.get('/addUser', _User.getAddUser);
route.post('/addUser', [
    body('email', 'Email không hợp lệ').isEmail().custom((value, { req }) => {
        return _UserModel.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return new Promise.reject('Email exists already, please pick a different one!');
                }
            })
    }),
    body('password', 'Mật khẩu phải lớn hơn 5 ký tự và không chứa ký tự đặc biệt!').isLength({ min: 5 }).isAlphanumeric().trim(),
    body('username', 'Họ và tên bắt buộc nhập!').not().isEmpty(),
    body('doB', 'Ngày sinh không hợp lệ').isBefore(moment().format('YYYY-MM-DD')),
    // body('salaryScale', 'Hệ số lương phải lớn hơn 0').isAfter(0),
    // body('startDate', 'Ngày bắt đầu bắt buộc nhập').not().isEmpty(),
    // body('annualLeave', 'Số nghỉ phải lớn hơn hoặc bằng 0').isAfter(0)
], _User.postAddUser);

module.exports = route;