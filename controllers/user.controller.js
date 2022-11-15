const moment = require("moment");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const _User = require("../models/user.model");
const _TimeRecording = require("../models/timeRecording.model");
const _TimeItem = require("../models/timeItem.model");

// ADD USER
module.exports.getAddUser = (req, res, next) => {
    res.render("user/addUser", {
        title: "Điểm danh",
        img_user: "imagesimage-1667714506718.PNG",
        numActive: 3,
    });
};
module.exports.postAddUser = (req, res, next) => {
    const image = req.file;
    const errors = validationResult(req);
    if (!image) {
        console.log("Chưa chọn hình ảnh");
    }
    bcryptjs
        .hash(req.body.password, 12)
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
                    lstUser: [],
                },
                department: req.body.department,
                initialAnnual: req.body.annualLeave * 8,
                annualLeave: req.body.annualLeave * 8,
                image: image.path,
                ownerId: "636a075e84cc2fea274c5684",
            });
            return user.save();
        })
        .then(result => {
            res.redirect("/login");
        })
        .catch(err => console.log(err));
};
//Admember
module.exports.getAddMember = (req, res, next) => {
    res.render("user/addMember", {
        title: "Thêm nhân viên",
        img_user: req.session.user.image,
        numActive: 3,
    });
};
module.exports.postAddMember = (req, res, next) => {
    const image = req.file;
    const errors = validationResult(req);
    if (!image) {
        console.log("Chưa chọn hình ảnh");
    }
    bcryptjs
        .hash(req.body.password, 12)
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
                ownerId: req.session.user._id,
            });
            user.save((err, doc) => {
                if (err) {
                    console.log(err);
                }
                _User
                    .updateOne(
                        { _id: req.session.user._id },
                        {
                            $push: { "isAdmin.lstUser": { memberId: doc._id } },
                        }
                    )
                    .then(result => {
                        return result;
                    });
            });
        })
        .then(result => {
            res.redirect("/");
        })
        .catch(err => console.log(err));
};

module.exports.getLookup = async (req, res, next) => {
    // Set Limit page
    let dataPrimary = {};
    let page = +req.query.page || 1;
    let pagesize = +req.query.pagesize || 5;
    let sortDay = +req.query.sortDay;
    let sortWorkPlace = req.query.sortWorkPlace === 'true' ? true : false || false;
    _User
        .findById(req.session.user._id)
        .populate("ownerId", "userName")
        .then(dataUser => {
            dataPrimary.userInfo = dataUser;
            let promise;

            if (sortDay === -1 || sortDay === 1) {
                promise = _TimeRecording
                    .find({ userId: req.session.user._id })
                    .populate("annuals.annualId")
                    .sort({ month: sortDay })
            }
            else {
                promise = _TimeRecording
                    .find({ userId: req.session.user._id })
                    .populate("annuals.annualId")
            }
            promise.then(data => {
                let lst_idTimeRecording = [];
                let dataInfo = [];
                data.forEach(item => {
                    lst_idTimeRecording.push(item._id);
                });
                _TimeItem.countDocuments()
                    .then(numItem => {
                        let promiseTimeItem; // Promise cho option sort
                        if (sortDay === -1 || sortDay === 1 || sortWorkPlace) {
                            if (sortWorkPlace === true && sortDay != -1 && sortDay != 1) {
                                promiseTimeItem = _TimeItem
                                    .find({ timeRecordingId: { $in: lst_idTimeRecording } })
                                    .sort({ workPlace: 1 });
                            }
                            else if ((sortDay === -1 || sortDay === 1) && sortWorkPlace === false) {
                                promiseTimeItem = _TimeItem
                                    .find({ timeRecordingId: { $in: lst_idTimeRecording } })
                                    .sort({ startTime: sortDay });
                            }
                            else {
                                promiseTimeItem = _TimeItem
                                    .find({ timeRecordingId: { $in: lst_idTimeRecording } })
                                    .sort({ workPlace: 1 });
                                promiseTimeItem.sort({ startTime: sortDay })
                            }
                        } else {
                            sortDay = -1;
                            promiseTimeItem = _TimeItem
                                .find({ timeRecordingId: { $in: lst_idTimeRecording } })
                                .sort({ startTime: sortDay })
                        }
                        promiseTimeItem.skip((page - 1) * pagesize).limit(pagesize)
                        promiseTimeItem.then(result => {
                            data.forEach(itemRecording => {
                                let tempObj = {
                                    year: itemRecording.year,
                                    month: itemRecording.month,
                                    isBlock: itemRecording.isBlock,
                                    numMandatoryDay: itemRecording.numMandatoryDay,
                                    totalWorkingTime_M: itemRecording.totalWorkingTime_M,
                                    lackTime_M: itemRecording.lackTime_M,
                                    overTime_M: itemRecording.overTime_M,
                                    annuals: itemRecording.annuals,
                                    userId: itemRecording.userId,
                                };
                                let dayTimes = [];
                                // Lay thong tin cua ngay
                                itemRecording.dayTimes.forEach(itemDayTime => {
                                    let tempObjDay = {
                                        dayTime: itemDayTime.dayTime,
                                        times: itemDayTime.times
                                    };
                                    //Kiem tra co dang ky nghi k
                                    const isDayoffIndex = itemRecording.annuals.findIndex(annual => {
                                        return annual.annualId.dayOff.indexOf(itemDayTime.dayTime) >= 0;
                                    })
                                    if (isDayoffIndex >= 0) { //Cong them gio nghi vao ngay neu ngay nghi ma co lam viec
                                        const tempAnnual = itemRecording.annuals[isDayoffIndex].annualId;
                                        const timeAnnual = (tempAnnual.timeAnnual > 8 ? 8 : tempAnnual.timeAnnual) * 60;

                                        tempObjDay.totalWorkingTime = timeAnnual + itemDayTime.totalWorkingTime;
                                        tempObjDay.lackTime = 480 - (timeAnnual + itemDayTime.totalWorkingTime) >= 0 ? 480 - (timeAnnual + itemDayTime.totalWorkingTime) : 0;
                                        tempObjDay.overTime = (timeAnnual + itemDayTime.totalWorkingTime) - 480 >= 0 ? (timeAnnual + itemDayTime.totalWorkingTime) - 480 : 0;
                                        tempObjDay.dayOff = tempAnnual;
                                    }
                                    else {
                                        tempObjDay.totalWorkingTime = itemDayTime.totalWorkingTime;
                                        tempObjDay.lackTime = itemDayTime.lackTime;
                                        tempObjDay.overTime = itemDayTime.overTime;
                                        tempObjDay.dayOff = null
                                    }
                                    // Lay nhung lan diem danh
                                    let times = [];

                                    itemDayTime.times.forEach(itemTime => {
                                        result.forEach(itemResult => {
                                            if (
                                                itemTime.timeItemId.toString() == itemResult._id.toString()
                                            ) {
                                                times.push(itemResult);
                                            }
                                        });
                                    });
                                    // Sort nhung lan diem danh theo gio trong ngay
                                    if (sortDay === 1) {
                                        times.sort((a, b) => {
                                            return moment(a.startTime) - moment(b.startTime);
                                        })
                                    }
                                    if (sortDay === -1) {
                                        times.sort((a, b) => {
                                            return moment(b.startTime) - moment(a.startTime);
                                        })
                                    }
                                    tempObjDay.times = times;
                                    dayTimes.push(tempObjDay);
                                });
                                if (sortDay === 1) {
                                    dayTimes.sort((a, b) => {
                                        return moment(a.dayTime) - moment(b.dayTime);
                                    })
                                }
                                if (sortDay === -1) {
                                    dayTimes.sort((a, b) => {
                                        return moment(b.dayTime) - moment(a.dayTime);
                                    })
                                }
                                tempObj.dayTimes = dayTimes;
                                let totalAnnual_M = 0;
                                if (itemRecording.annuals.length > 0) {
                                    itemRecording.annuals.forEach(anul => {
                                        totalAnnual_M += anul.annualId.timeAnnual;
                                    });
                                }
                                tempObj.totalAnnual_M = totalAnnual_M;
                                let check_endMonth = moment(moment().format(`${tempObj.year}-${tempObj.month.toString().length === 1 ? '0' + tempObj.month : tempObj.month}`)).endOf("month");
                                if (moment() <= check_endMonth) {
                                    tempObj.isWorking = true;
                                }
                                else {
                                    tempObj.isWorking = false;
                                }
                                // ===================== ==========Tinh Luong =========== =====================
                                // Lương = salaryScale * 3000000 + (overTime - số giờ làm thiếu) * 200000)
                                let salary =
                                    dataUser.salaryScale * 3000000 +
                                    Math.round(((tempObj.totalAnnual_M + tempObj.overTime_M - tempObj.lackTime_M) / 60)) * 200000;
                                tempObj.salaryMonth = changeMoney(salary);
                                dataInfo.push(tempObj);
                            });
                            dataPrimary.timeRecording = dataInfo;
                            res.render("user/lookup", {
                                title: "Tra cứu thông tin",
                                img_user: req.session.user.image,
                                numActive: 3,
                                _activeTab: 0,
                                data: dataPrimary,
                                moment: moment,
                                parseHour: parseHour,
                                currentPage: page,
                                lastPage: Math.ceil(numItem / pagesize),
                                pagesize: pagesize,
                                sortDay: sortDay,
                                sortWorkPlace: sortWorkPlace
                            });
                        });
                    })
            });
        });
};
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
//Func trả về lương theo định dạng tiền VNĐ=> 7.000.000
function changeMoney(money) {
    let x = '';
    if (typeof (money) == 'number') {
        money = money.toString();
        let mod = parseInt(money.length) % 3; // 1
        let sub = parseInt(money.length) / 3; // 2

        if (money.length > 3) {
            if (mod > 0) {
                x += money.substr(0, mod);
                for (let i = 1; i <= sub; i++) {
                    x += '.' + money.substr(mod, 3)
                    mod += 3;
                }
                x += ' VNĐ'
            } else {
                for (let i = 1; i <= sub; i++) {
                    if (i == 1) {
                        x += money.substr(mod, mod + 3)
                        mod += 3;
                    } else {
                        x += '.' + money.substr(mod, 3)
                        mod += 2;
                    }

                }
                x += ' VNĐ'
            }
        } else {
            x += money + ' VNĐ';
        }
    } else {
        x += money;
    }
    return x.trim();
}