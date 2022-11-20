const bcryptjs = require('bcryptjs');
const _User = require('../models/user.model');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
    let flashMes = req.flash('requireLogin');
    if (flashMes.length > 0) {
        flashMes = flashMes[0];
    }
    res.render('auth/login', {
        oldDoc: {
            email: '',
            password: ''
        },
        flashMes: flashMes,
        errMes: null
    });
}

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            oldDoc: {
                email: req.body.email,
                password: req.body.password
            },
            flashMes: null,
            errMes: 'Email hoặc mật khẩu không hợp lệ!'
        });
    }
    _User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    oldDoc: {
                        email: req.body.email,
                        password: req.body.password
                    },
                    flashMes: null,
                    errMes: 'Email hoặc mật khẩu không hợp lệ!'
                });
            }
            bcryptjs.compare(req.body.password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLogin = true;
                        req.session.user = user;
                        req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        })
                    } else {
                        let flashMes = req.flash('requireLogin');
                        if (flashMes.length > 0) {
                            flashMes = flashMes[0];
                        }
                        return res.status(422).render('auth/login', {
                            oldDoc: {
                                email: req.body.email,
                                password: req.body.password
                            },
                            errMes: 'Email hoặc mật khẩu không hợp lệ!',
                            flashMes: flashMes

                        });
                    }
                })
                .catch(err => {
                    throw new Error(err);
                })
        })
        .catch(err => console.log(err))
}
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/login');
    })
}