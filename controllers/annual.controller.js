const moment = require('moment');
// const { validationResult } = require('express-validator');
// const flash = require('connect-flash');
const _Annual = require('../models/annual.model');
const _User = require('../models/user.model');

module.exports.getTest = (req, res, next) => {
    const a = moment('2022-11-10');
    const b = moment('2022-11-20');
    //moment().diff(date_time, 'minutes')
    console.log(a.diff(b, 'days'))
    if (a == b) {
        console.log('a=b')
    } else {
        console.log('b!=a')
    }
}

module.exports.getAnnual = (req, res, next) => {
    let flashMes = req.flash('regAnnul');

    if (flashMes.length > 0) {
        flashMes = flashMes[0]
    } else {
        flashMes = null;
    }
    _User.findById({ _id: req.session.user._id })
        .populate('annuals.annualId')
        .then(data => {

            const dataSort = data.annuals.sort((a, b) => {
                return moment(b.annualId.startDateAnnual) - moment(a.annualId.startDateAnnual)
            })
            console.log(typeof(flashMes))
            res.render('annual/annual.ejs', {
                title: 'Đăng ký nghỉ',
                img_user: req.session.user.image,
                numActive: 2,
                moment: moment,
                flashMes: flashMes,
                data: dataSort,
                remainAnnual: data.annualLeave,
                registeredTime: data.initialAnnual - data.annualLeave,
                parseHour: parseHour
            });
        })
        .catch(err => console.log(err));
}

//Dang ky nghi
module.exports.postRegAnnual = (req, res, next) => {
    const fromDate = moment(req.body.fromDate);
    const toDate = moment(req.body.toDate);
    const cause = req.body.cause;
    const isHour = req.body.isHour === 'on' ? true : false;
    const numHour = req.body.numHour ? parseInt(req.body.numHour) : 0;
    let listDayWeekend = []; // List ngay t7, cn
    let listDayOffs = []; // list tach cac ngay from ->to
    let annualLeave = 0; //So ngay nghi con lai cua User
    let totalNumHour = 0; // tong so gio nghi dang ky
    let errDateWeekend = []; // cac ngay trung voi ngay nghi.. Neu length==0 => ok else => err

    //======================= Check date logic======================
    //GET annualLeave
    _User.findById(req.session.user._id)
        .select('annualLeave')
        .then(user => {
            annualLeave = user.annualLeave;
        })
        .catch(err => console.log(err));
    //get list ngay nghi cua thang --t7 va chu nhat
    if (fromDate.format('YYYY-MM') === toDate.format('YYYY-MM')) {
        listDayWeekend = numWeekendOfMonth(fromDate.format('YYYY-MM'));
    } else {
        const lstFromDate = numWeekendOfMonth(fromDate.format('YYYY-MM'));
        const lstToDate = numWeekendOfMonth(toDate.format('YYYY-MM'));
        listDayWeekend = lstFromDate.concat(lstToDate);
    }

    //Tach ngay tu ngay den ngay
    listDayOffs = getRangeOfDates(fromDate, toDate, 'day');
    //=======================End Check date logic===================

    // Check is in listWeekend
    listDayOffs.forEach(element => {
        if (listDayWeekend.indexOf(element) > 0) {
            errDateWeekend.push(element);
        }
    });
    if (errDateWeekend.length > 0) {
        req.flash('regAnnul', 'Thời gian đăng ký nghỉ đã trùng với ngày nghỉ trong tuần. Vui lòng kiểm tra lại!')
        return res.redirect('/annual');
    }
    //cal numHour
    if (isHour && numHour > 0) { //Nghi theo gio
        totalNumHour = numHour;
        _Annual.find({
                userId: req.session.user._id,
                dayOff: { '$in': [fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD')] },
            })
            .then(data => {
                console.log(data);
                if (data.length > 0) {
                    const hourIndex = data.findIndex(i => {
                        return i.timeAnnual < 8 &&
                            moment(i.startDateAnnual).format('YYYY-MM-DD') == fromDate.format('YYYY-MM-DD') &&
                            moment(i.endDateAnnual).format('YYYY-MM-DD') == toDate.format('YYYY-MM-DD') &&
                            i.isTimeAnnual === true
                    })
                    if (hourIndex >= 0) {
                        if ((data[hourIndex].timeAnnual + totalNumHour) > 8) {
                            req.flash('regAnnul', 'Đã tồn tại lần đăng ký nghỉ theo giờ và tổng thời gian đăng ký nghỉ vượt quá 8h trong 1 ngày. Vui lòng kiểm tra lại!');
                            return res.redirect('/annual');
                        }
                        //Update
                        if ((annualLeave - totalNumHour) < 0) {
                            req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                            return res.redirect('/annual');
                        }
                        data[hourIndex].timeAnnual = data[hourIndex].timeAnnual + totalNumHour;
                        data[hourIndex].causeAnnual = `#1. ${data[hourIndex].causeAnnual} \n #2. ${cause}`;
                        data[hourIndex].isTimeAnnual = (data[hourIndex].timeAnnual + totalNumHour) < 8 ? true : false;
                        return data[hourIndex].save((err, doc) => {
                            if (err) {
                                console.log(err);
                            }
                            _User.updateOne({ _id: req.session.user._id }, { '$set': { annualLeave: (annualLeave - totalNumHour) } })
                                .then(data => {
                                    req.flash('regAnnul', 'yes');
                                    res.redirect('/annual');
                                })
                                .catch(err => console.log(err));
                        });
                    }
                    req.flash('regAnnul', 'Đã tồn tại ngày đăng ký nghỉ. Vui lòng kiểm tra lại!');
                    return res.redirect('/annual');
                    //Update
                } else {
                    if ((annualLeave - totalNumHour) < 0) {
                        req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                        return res.redirect('/annual');
                    }
                    const newAnnual = new _Annual({
                        startDateAnnual: fromDate.format('YYYY-MM-DD'),
                        endDateAnnual: toDate.format('YYYY-MM-DD'),
                        timeAnnual: totalNumHour,
                        causeAnnual: cause,
                        dayOff: listDayOffs,
                        isTimeAnnual: true,
                        userId: req.session.user._id
                    })
                    newAnnual.save((err, doc) => {
                        if (err) {
                            console.log(err);
                        }
                        _User.updateOne({ _id: req.session.user._id }, { '$push': { annuals: { annualId: doc._id } }, annualLeave: annualLeave - totalNumHour })
                            .then(data => {
                                req.flash('regAnnul', 'yes');
                                res.redirect('/annual');
                            })
                            .catch(err => console.log(err));
                    })
                }
            })
    } else { //Nghi theo ngay
        totalNumHour = listDayOffs.length * 8;
        _Annual.find({
                userId: req.session.user._id,
                dayOff: { '$in': [fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD')] }
            })
            .then(data => {
                if (data.length > 0) { // ngay dang ky khong hop le.
                    //Return trung vs ngay da dang ky
                    req.flash('regAnnul', 'Đã tồn tại ngày đăng ký nghỉ. Vui lòng kiểm tra lại!');
                    return res.redirect('/annual');
                } else { //Ngay dang ky hop le
                    if ((annualLeave - totalNumHour) < 0) {
                        req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                        return res.redirect('/annual');
                    }
                    const newAnnual = new _Annual({
                        startDateAnnual: fromDate.format('YYYY-MM-DD'),
                        endDateAnnual: toDate.format('YYYY-MM-DD'),
                        timeAnnual: totalNumHour,
                        causeAnnual: cause,
                        dayOff: listDayOffs,
                        isTimeAnnual: false,
                        userId: req.session.user._id
                    })
                    newAnnual.save((err, doc) => {
                        if (err) {
                            console.log(err);
                        }
                        _User.updateOne({ _id: req.session.user._id }, { '$push': { annuals: { annualId: doc._id } }, annualLeave: annualLeave - totalNumHour })
                            .then(data => {
                                req.flash('regAnnul', 'yes');
                                res.redirect('/annual');
                            })
                            .catch(err => console.log(err));
                    })
                }
            })
            .catch(err => console.log(err));
    }
}

//Func tách từ ngày đến ngày thành các ngày chi tiết
function getRangeOfDates(start, end, key, arr = [start.startOf(key).format('YYYY-MM-DD')]) {
    const next = moment(start).add(1, key).startOf(key);
    if (next.isAfter(end, key)) return arr;
    return getRangeOfDates(next, end, key, arr.concat(next.format('YYYY-MM-DD')));
}

//Func số ngày nghỉ của tháng... trả về tổng số ngày thứ 7 và chủ nhật của tháng
function numWeekendOfMonth(monthYear) {
    let firstDayOfMonth = moment(monthYear).startOf("month");
    let end = moment(monthYear).endOf("month");
    let arr = []; //array ngay ghi
    //let temp = 0;
    while (firstDayOfMonth <= end) {
        if (
            firstDayOfMonth.format("dddd") === "Sunday" ||
            firstDayOfMonth.format("dddd") === "Saturday"
        ) {
            arr.push(firstDayOfMonth.format('YYYY-MM-DD'))
                //temp++;
        }
        firstDayOfMonth.add(1, "days");
    }
    return arr;
}

//Func doi phut thành giờ || giờ thành ngày
function parseHour(hour, type) {
    let result = "";
    //minutes to hour
    if (type === 0) {
        if (hour === 0) {
            result += hour + " phút";
        } else {
            if (parseInt(hour / 60) > 0) {
                result += parseInt(hour / 60).toString() + " giờ ";
            }
            if (parseInt(hour % 60) > 0) {
                result += parseInt(hour % 60).toString() + " phút";
            }
        }
    } else {
        if (hour === 0) {
            result += hour + " giờ";
        }
        if (parseInt(hour / 8) > 0) {
            result += parseInt(hour / 8).toString() + " ngày ";
        }
        if (parseInt(hour % 8) > 0) {
            result += parseInt(hour % 8).toString() + " giờ ";
        }
    }
    return result;
}