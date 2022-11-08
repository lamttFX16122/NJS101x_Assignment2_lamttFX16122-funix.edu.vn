const moment = require('moment');
const _Annual = require('../models/annual.model');
const _User = require('../models/user.model');
const _TimeRecording = require('../models/timeRecording.model');

module.exports.getTest = (req, res, next) => {
    _TimeRecording.findOne({
            userId: req.session.user._id,
            year: parseInt(moment().format('YYYY')),
            month: parseInt(moment().format('MM'))
        })
        .populate('annuals.annualId')
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err));
}

module.exports.getAnnual = (req, res, next) => {
    let flashMes = req.flash('regAnnul');
    let annualLeave = 0;
    if (flashMes.length > 0) {
        flashMes = flashMes[0]
    } else {
        flashMes = null;
    }
    //GET annualLeave
    _User.findById(req.session.user._id)
        .then(user => {
            annualLeave = user.annualLeave;
            _TimeRecording.find({ userId: req.session.user._id, year: parseInt(moment().format('YYYY')) })
                .populate('annuals.annualId')
                .then(data => {
                    const dataSort = data.sort((a, b) => {
                        return moment(b.month) - moment(a.month)
                    })
                    res.render('annual/annual.ejs', {
                        title: 'Đăng ký nghỉ',
                        img_user: req.session.user.image,
                        numActive: 2,
                        moment: moment,
                        flashMes: flashMes,
                        data: dataSort,
                        remainAnnual: annualLeave,
                        registeredTime: req.session.user.initialAnnual - annualLeave,
                        parseHour: parseHour
                    });

                })
                .catch(err => console.log(err));
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
    let _annualLeave = 0; //So ngay nghi con lai cua User
    let totalNumHour = 0; // tong so gio nghi dang ky
    let errDateWeekend = []; // cac ngay trung voi ngay nghi.. Neu length==0 => ok else => err

    //======================= Check date logic======================
    //GET annualLeave

    _User.findById(req.session.user._id)
        .then(user => {
            console.log(user.annualLeave)
            _annualLeave = user.annualLeave;

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

                _TimeRecording.findOne({
                        userId: req.session.user._id,
                        year: parseInt(fromDate.format('YYYY')),
                        month: parseInt(fromDate.format('MM'))
                    })
                    .populate('annuals.annualId')
                    .then(data => {
                        if (data) {
                            const hourIndex = data.annuals.findIndex(i => {
                                return i.annualId.timeAnnual < 8 &&
                                    moment(i.annualId.startDateAnnual).format('YYYY-MM-DD') == fromDate.format('YYYY-MM-DD') &&
                                    moment(i.annualId.endDateAnnual).format('YYYY-MM-DD') == toDate.format('YYYY-MM-DD') &&
                                    i.annualId.isTimeAnnual === true
                            })
                            console.log((data.annuals[hourIndex].annualId.timeAnnual + totalNumHour))
                            console.log((data.annuals[hourIndex] + totalNumHour))
                            if (hourIndex >= 0) {
                                if ((data.annuals[hourIndex].annualId.timeAnnual + totalNumHour) > 8) {
                                    req.flash('regAnnul', 'Đã tồn tại lần đăng ký nghỉ theo giờ và tổng thời gian đăng ký nghỉ vượt quá 8h trong 1 ngày. Vui lòng kiểm tra lại!');
                                    return res.redirect('/annual');
                                }
                                //Update
                                if ((_annualLeave - totalNumHour) < 0) {
                                    req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                                    return res.redirect('/annual');
                                }
                                data.annuals[hourIndex].annualId.timeAnnual = data.annuals[hourIndex].annualId.timeAnnual + totalNumHour;
                                data.annuals[hourIndex].annualId.causeAnnual = `#1. ${data.annuals[hourIndex].annualId.causeAnnual} \n #2. ${cause}`;
                                data.annuals[hourIndex].annualId.isTimeAnnual = (data.annuals[hourIndex].annualId.timeAnnual + totalNumHour) < 8 ? true : false;
                                return data.annuals[hourIndex].annualId.save((err, doc) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    _User.updateOne({
                                            _id: req.session.user._id
                                        }, { annualLeave: _annualLeave - totalNumHour })
                                        .then(data => {
                                            req.flash('regAnnul', 'yes');
                                            res.redirect('/annual');
                                        })
                                        .catch(err => console.log(err));
                                });

                            }
                            const indexDate = data.annuals.findIndex(i => {
                                return i.annualId.dayOff.indexOf(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD')) >= 0;
                            })
                            if (indexDate >= 0) {
                                req.flash('regAnnul', 'Đã tồn tại ngày đăng ký nghỉ. Vui lòng kiểm tra lại!');
                                return res.redirect('/annual');
                            }
                            const newAnnual = new _Annual({
                                startDateAnnual: fromDate.format('YYYY-MM-DD'),
                                endDateAnnual: toDate.format('YYYY-MM-DD'),
                                timeAnnual: totalNumHour,
                                causeAnnual: cause,
                                dayOff: listDayOffs,
                                isTimeAnnual: true,
                                timeRecordingId: data._id
                            })
                            newAnnual.save((err, doc) => {
                                if (err) {
                                    console.log(err);
                                }
                                _TimeRecording.updateOne({
                                        _id: doc.timeRecordingId
                                    }, { '$push': { annuals: { annualId: doc._id } } })
                                    .then(data => {
                                        _User.updateOne({
                                                _id: req.session.user._id
                                            }, { annualLeave: _annualLeave - totalNumHour })
                                            .then(data => {
                                                req.flash('regAnnul', 'yes');
                                                res.redirect('/annual');
                                            })
                                            .catch(err => console.log(err));
                                    })
                                    .catch(err => console.log(err));
                            })

                            //Update
                        } else {
                            if ((_annualLeave - totalNumHour) < 0) {
                                req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                                return res.redirect('/annual');
                            }

                            //Neu la thang moi thi tao moi thang
                            let str_yearMonth = `${fromDate.format('YYYY')}-${fromDate.format('MM').length === 1
                                  ? +"0" + fromDate.format('MM'): fromDate.format('MM')}`;
                            const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                            const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat
                            console.log('weekendOfMonth', weekendOfMonth)
                            console.log('numOfMonthTemp', numOfMonthTemp)
                            let newTimeRecording = new _TimeRecording({
                                year: parseInt(fromDate.format('YYYY')),
                                month: parseInt(fromDate.format('MM')),
                                numMandatoryDay: numOfMonthTemp - weekendOfMonth.length,
                                isWorking: false,
                                isBlock: false,
                                userId: req.session.user._id
                            })

                            let newAnnual = new _Annual({
                                startDateAnnual: fromDate.format('YYYY-MM-DD'),
                                endDateAnnual: toDate.format('YYYY-MM-DD'),
                                timeAnnual: totalNumHour,
                                causeAnnual: cause,
                                dayOff: listDayOffs,
                                isTimeAnnual: true,
                                timeRecordingId: newTimeRecording._id
                            })
                            newTimeRecording.annuals = [{
                                annualId: newAnnual._id
                            }];
                            newAnnual.save((err, doc) => {
                                if (err) {
                                    console.log(err);
                                }
                                newTimeRecording.save((err, tDoc) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log('===', tDoc)
                                    _User.updateOne({ _id: req.session.user._id }, {
                                            "$push": { timeRecordings: { timeRecordingId: tDoc._id } },
                                            annualLeave: _annualLeave - totalNumHour
                                        })
                                        .then(data => {
                                            req.flash('regAnnul', 'yes');
                                            res.redirect('/annual');
                                        })
                                        .catch(err => console.log(err));
                                })

                            })
                        }
                    })
            } else { //Nghi theo ngay
                totalNumHour = listDayOffs.length * 8;
                _TimeRecording.findOne({
                        userId: req.session.user._id,
                        year: parseInt(fromDate.format('YYYY')),
                        month: parseInt(fromDate.format('MM'))
                    })
                    .populate('annuals.annualId')
                    .then(data => {
                        if (data) {
                            const hourIndex = data.annuals.findIndex(i => {
                                return i.annualId.dayOff.indexOf(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD')) >= 0;
                            })
                            if (hourIndex >= 0) { // ngay dang ky khong hop le.
                                //Return trung vs ngay da dang ky
                                req.flash('regAnnul', 'Đã tồn tại ngày đăng ký nghỉ. Vui lòng kiểm tra lại!');
                                return res.redirect('/annual');
                            } else {
                                if ((_annualLeave - totalNumHour) < 0) {
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
                                    timeRecordingId: data._id
                                })
                                newAnnual.save((err, doc) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    _TimeRecording.updateOne({
                                            _id: doc.timeRecordingId
                                        }, { '$push': { annuals: { annualId: doc._id } } })
                                        .then(data => {
                                            _User.updateOne({
                                                    _id: req.session.user._id
                                                }, { annualLeave: _annualLeave - totalNumHour })
                                                .then(data => {
                                                    req.flash('regAnnul', 'yes');
                                                    res.redirect('/annual');
                                                })
                                                .catch(err => console.log(err));
                                        })
                                        .catch(err => console.log(err));
                                })
                            }
                        } else { //Ngay dang ky hop le
                            if ((_annualLeave - totalNumHour) < 0) {
                                req.flash('regAnnul', 'Thời gian đăng ký nghỉ lớn hơn thời gian nghỉ còn lại!');
                                return res.redirect('/annual');
                            }

                            //Neu la thang moi thi tao moi thang
                            let str_yearMonth = `${fromDate.format('YYYY')}-${fromDate.format('MM').length === 1
                                  ? +"0" + fromDate.format('MM'): fromDate.format('MM')}`;
                            const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                            const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat
                            console.log('weekendOfMonth', weekendOfMonth)
                            console.log('numOfMonthTemp', numOfMonthTemp)
                            let newTimeRecording = new _TimeRecording({
                                year: parseInt(fromDate.format('YYYY')),
                                month: parseInt(fromDate.format('MM')),
                                numMandatoryDay: numOfMonthTemp - weekendOfMonth.length,
                                isWorking: false,
                                isBlock: false,
                                userId: req.session.user._id
                            })

                            let newAnnual = new _Annual({
                                startDateAnnual: fromDate.format('YYYY-MM-DD'),
                                endDateAnnual: toDate.format('YYYY-MM-DD'),
                                timeAnnual: totalNumHour,
                                causeAnnual: cause,
                                dayOff: listDayOffs,
                                isTimeAnnual: false,
                                timeRecordingId: newTimeRecording._id
                            })
                            newTimeRecording.annuals = [{
                                annualId: newAnnual._id
                            }];
                            newAnnual.save((err, doc) => {
                                if (err) {
                                    console.log(err);
                                }
                                newTimeRecording.save((err, tDoc) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    _User.updateOne({ _id: req.session.user._id }, {
                                            "$push": { timeRecordings: { timeRecordingId: tDoc._id } },
                                            annualLeave: _annualLeave - totalNumHour
                                        })
                                        .then(data => {
                                            console.log(data);
                                            req.flash('regAnnul', 'yes');
                                            res.redirect('/annual');
                                        })
                                        .catch(err => console.log(err));
                                })

                            })
                        }
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
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