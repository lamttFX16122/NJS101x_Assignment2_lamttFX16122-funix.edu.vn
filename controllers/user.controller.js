const moment = require('moment');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const _User = require('../models/user.model');

// ADD USER
module.exports.getAddUser = (req, res, next) => {
    res.render('user/addUser', {
        title: 'Điểm danh',
        img_user: 'images\image-1667714506718.PNG',
        numActive: 3,
    });
}
module.exports.postAddUser = (req, res, next) => {
    console.log(req.body);
    const image = req.file;
    const errors = validationResult(req);
    if (!image) {
        console.log('Chưa chọn hình ảnh');
    }
    bcryptjs.hash(req.body.password, 12)
        .then(hashPw => {
            const user = new _User({
                email: req.body.email,
                password: hashPw,
                userName: req.body.username,
                doB: req.body.doB,
                salaryScale: req.body.salaryScale,
                startDate: req.body.startDate,
                department: req.body.department,
                annualLeave: req.body.annualLeave * 8,
                image: image.path,
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
}