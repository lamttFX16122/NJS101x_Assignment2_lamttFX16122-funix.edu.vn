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
                    isAdmin: {
                        admin: true,
                        lstUser: []
                    },
                    department: req.body.department,
                    initialAnnual: req.body.annualLeave * 8,
                    annualLeave: req.body.annualLeave * 8,
                    image: image.path,
                    ownerId: '636a075e84cc2fea274c5684'
                });
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
            })
            .catch(err => console.log(err));
    }
    //Admember
module.exports.getAddMember = (req, res, next) => {
    res.render('user/addMember', {
        title: 'Thêm nhân viên',
        img_user: req.session.user.image,
        numActive: 3,
    });
}
module.exports.postAddMember = (req, res, next) => {
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
                initialAnnual: req.body.annualLeave * 8,
                annualLeave: req.body.annualLeave * 8,
                image: image.path,
                ownerId: req.session.user._id
            });
            user.save((err, doc) => {
                if (err) {
                    console.log(err);
                }
                _User.updateOne({ _id: req.session.user._id }, {
                        '$push': { 'isAdmin.lstUser': { memberId: doc._id } }
                    })
                    .then(result => {
                        return result;
                    })
            });
        })
        .then(result => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
}