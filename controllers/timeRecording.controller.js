const moment = require("moment");
const momentTZ = require("moment-timezone");
const mongoose = require('mongoose');
const _TimeRecording = require("../models/timeRecording.model");
const _User = require("../models/user.model");
const _TimeItem = require("../models/timeItem.model");
module.exports.getTimeRecording = (req, res, next) => {
    let isNew = false;
    _TimeRecording
        .findOne({
            userId: req.session.user._id,
            year: parseInt(moment().format("YYYY")),
            month: parseInt(moment().format("MM")),
        })
        .then((data) => {
            if (!data) {
                //Neu la thang moi thi tao moi thang
                let str_yearMonth = `${moment().format("YYYY")}-${moment().format("MM").length === 1 ? +"0" + moment().format("MM") : moment().format("MM")}`;
                const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

                let item = new _TimeRecording({
                    year: parseInt(moment().format("YYYY")),
                    month: parseInt(moment().format("MM")),
                    numMandatoryDay: numOfMonthTemp - weekendOfMonth,
                    isWorking: false,
                    isBlock: false,
                    userId: req.session.user._id,
                });
                isNew = true;
                return item.save();
            }
            return data;
        })
        .then((data) => {
            if (isNew) {
                //Them timeRecording moi vao user
                return _User.updateOne({ _id: req.session.user._id, $push: { timeRecordings: { timeRecordingId: data._id } } });
            }
            return data;
        })
        .then((data) => {
            _TimeRecording
                .findOne({
                    userId: req.session.user._id,
                    year: parseInt(moment().format("YYYY")),
                    month: parseInt(moment().format("MM")),
                })
                .populate("dayTimes")
                .populate({
                    path: "dayTimes.times",
                    populate: "timeItemId",
                })
                .then((item) => {
                    let monthInfo = {
                        isWorking: item.isWorking,
                        monthInfo_id: item._id,
                    };

                    // Fil day now
                    const dayIndex = item.dayTimes.findIndex((i) => {
                        return i.dayTime === moment().format("YYYY-MM-DD");
                    });

                    if (dayIndex >= 0) {
                        const temp = item.dayTimes[dayIndex];
                        monthInfo.dayTime = temp.dayTime;
                        monthInfo.totalWorkingTime = temp.totalWorkingTime;
                        monthInfo.lackTime = temp.lackTime;
                        monthInfo.overTime = temp.overTime;
                        monthInfo.times = temp.times.sort((a, b) => {
                            return b.timeItemId.startTime - a.timeItemId.startTime;
                        });
                        monthInfo.day_id = temp._id;

                        if (temp.times.length > 0) {
                            const load = temp.times.findIndex((j) => {
                                return j.timeItemId.isLoading === true;
                            });
                            if (load >= 0) {
                                monthInfo.isLoading = load;
                            } else {
                                monthInfo.isLoading = -1;
                            }
                        } else {
                            monthInfo.isLoading = -1;
                        }
                        monthInfo.newpie = true;
                    } else {
                        monthInfo.times = [];
                        monthInfo.isLoading = -1;
                        monthInfo.day_id = "";
                        monthInfo.newpie = false;
                    }
                    res.render("timeRecording/timeRecording.ejs", {
                        title: "Điểm danh",
                        img_user: req.session.user.image,
                        numActive: 1,
                        timeItems: monthInfo,
                        userName: req.session.user.userName,
                        userId: req.session.user._id,
                        moment: moment,
                        parseHour: parseHour,
                        isAdmin: req.session.user.isAdmin.admin
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => console.log(err));
};
module.exports.postTimeRecording = (req, res, next) => {
    const workPlace = req.body.workPlace;
    const month_id = req.body.month_id;
    const itemNew = new _TimeItem({
        startTime: moment(),
        isLoading: true,
        workPlace: workPlace,
        timeRecordingId: month_id,
    });
    itemNew.save((err, doc) => {
        if (err) {
            console.log(err);
        }
        _TimeRecording
            .findById(month_id)
            .then((data) => {
                const dayIndex = data.dayTimes.findIndex((i) => {
                    return i.dayTime == moment().format("YYYY-MM-DD");
                });
                if (dayIndex >= 0) {
                    // da co ngay
                    data.dayTimes[dayIndex].times.push({ timeItemId: doc._id });
                } else {
                    const newDay = {
                        dayTime: moment().format("YYYY-MM-DD"),
                        times: [
                            {
                                timeItemId: doc._id,
                            },
                        ],
                    };
                    data.dayTimes.push(newDay);
                }
                data.save((err, Idoc) => {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect("/");
                });
            })
            .catch((err) => console.log(err));
    });
};
module.exports.postEndTime = (req, res, next) => {
    const month_id = req.body.month_id;
    const item_id = req.body.item_id;
    _TimeItem
        .findById(item_id)
        .then((data) => {
            let totalTime = moment().diff(data.startTime, "minutes");
            data.endTime = moment();
            data.numOfHour = totalTime; //Phut
            data.isLoading = false;
            addTime = totalTime;
            data.save((err, doc) => {
                _TimeRecording.findById(month_id).then((result) => {
                    const dayIndex = result.dayTimes.findIndex((i) => {
                        return i.dayTime == moment(data.startTime).format("YYYY-MM-DD");
                    });
                    result.dayTimes[dayIndex].totalWorkingTime += totalTime; //Phut
                    result.dayTimes[dayIndex].lackTime = 480 - result.dayTimes[dayIndex].totalWorkingTime >= 0 ? 480 - result.dayTimes[dayIndex].totalWorkingTime : 0;
                    result.dayTimes[dayIndex].overTime = result.dayTimes[dayIndex].totalWorkingTime - 480 >= 0 ? result.dayTimes[dayIndex].totalWorkingTime - 480 : 0;

                    //cong don thoi gian cua thang
                    result.totalWorkingTime_M += totalTime;
                    result.lackTime_M = result.numMandatoryDay * 8 * 60 - result.totalWorkingTime_M >= 0 ? result.numMandatoryDay * 8 * 60 - result.totalWorkingTime_M : 0;
                    result.overTime_M = result.totalWorkingTime_M - result.numMandatoryDay * 8 * 60 >= 0 ? result.totalWorkingTime_M - result.numMandatoryDay * 8 * 60 : 0;
                    result.save((err, idoc) => {
                        if (err) {
                            console.log(err);
                        }
                        res.redirect("/");
                    });
                });
            });
        })
        .catch((err) => console.log(err));
};
// module.exports.insertTimeRecording = (req, res, next) => {
//     const isInsert = insertMonth(req, 9, 2022);
//     if (isInsert) {
//         res.send("OKKKKKKKK");
//     }
// };
module.exports.getConfirm = (req, res, next) => {
    const memberId = req.query.member;
    // let str_yearMonth = `${year}-${month.length === 1 ? +"0" + month : month}`;
    let currentMonth = moment().format('YYYY-MM'); //Ngay ket thuc

    if (memberId) {
        let dataInfo = {};
        _User.findById(memberId)
            .then(userData => {
                dataInfo.userData = userData; //Add userData vao object main
                _TimeRecording.find({ userId: memberId })
                    .populate("dayTimes")
                    .populate({
                        path: "dayTimes.times",
                        populate: "timeItemId",
                    })
                    .populate({
                        path: 'annuals.annualId'
                    })
                    .then(timeRecordingData => {
                        let timeRecordings = [];
                        timeRecordingData.forEach(monthItem => {
                            let totalAnnual = 0;
                            let objTemp = {
                                _id: monthItem._id,
                                year: monthItem.year,
                                month: monthItem.month,
                                // isWorking: monthItem.isWorking,
                                isBlock: monthItem.isBlock,
                                numMandatoryDay: monthItem.numMandatoryDay,
                                userId: monthItem.userId,
                                annuals: monthItem.annuals,
                                dayTimes: monthItem.dayTimes
                            };
                            if (`${monthItem.year}-${monthItem.month}` === currentMonth) {
                                objTemp.isWorking = true;
                            }
                            else {
                                objTemp.isWorking = false;
                            }
                            monthItem.annuals.forEach(annual => {
                                totalAnnual += annual.annualId.timeAnnual;
                            })
                            objTemp.totalWorkingTime_M = monthItem.totalWorkingTime_M + totalAnnual;
                            objTemp.totalAnnual = totalAnnual;

                            let totalWork = objTemp.totalWorkingTime_M;
                            objTemp.lackTime_M = monthItem.numMandatoryDay * 8 * 60 - totalWork >= 0 ? monthItem.numMandatoryDay * 8 * 60 - totalWork : 0;
                            objTemp.overTime_M = totalWork - monthItem.numMandatoryDay * 8 * 60 >= 0 ? totalWork - monthItem.numMandatoryDay * 8 * 60 : 0;
                            let salary =
                                userData.salaryScale * 3000000 +
                                Math.round(((objTemp.overTime_M - objTemp.lackTime_M) / 60)) * 200000;
                            objTemp.salary = changeMoney(salary);
                            timeRecordings.push(objTemp);
                        })
                        dataInfo.timeRecordings = timeRecordings;

                        let flashMes = req.flash('confirmMember'); //, `removed-${data._id}`

                        let isShow = '';
                        if (flashMes.length > 0) {
                            const mesTemp = flashMes[0];
                            const index = mesTemp.indexOf('-');
                            flashMes = mesTemp.substring(0, index);
                            isShow += mesTemp.substring(index + 1, mesTemp.length);
                        }
                        res.render("timeRecording/confirmMember.ejs", {
                            title: "Xác nhận giờ làm nhân viên",
                            img_user: req.session.user.image,
                            isAdmin: req.session.user.isAdmin.admin,
                            numActive: 5,
                            data: dataInfo,
                            isShow: isShow,
                            flashMes: flashMes,
                            moment: moment,
                            parseHour: parseHour
                        });
                    })
            })
    } else {
        _User.findById(req.session.user._id)
            .populate({
                path: 'isAdmin',
                populate: {
                    path: 'lstUser.memberId'
                }
            })
            .then(data => {
                // console.log(data)
                res.render("timeRecording/confirm.ejs", {
                    title: "Xác nhận giờ làm",
                    img_user: req.session.user.image,
                    numActive: 5,
                    data: data,
                    moment: moment,
                    isAdmin: req.session.user.isAdmin.admin
                });
            })
    }

}

module.exports.removeTimeItem = (req, res, next) => {
    const dayTimeItem_id = req.body.id_daytime_remove;
    const timeItem_id = req.body.id_time_remove;
    const id_member = req.body.id_member;

    _TimeItem.findOneAndRemove({ _id: timeItem_id })
        .then(result => {
            _TimeRecording.findById({ _id: result.timeRecordingId })
                .populate('userId', 'numMandatoryDay')
                .then(data => {
                    const dayTimeindex = data.dayTimes.findIndex(i => {
                        return i._id == dayTimeItem_id;
                    })
                    const timeItemIndex = data.dayTimes[dayTimeindex].times.findIndex(j => {
                        return j.timeItemId == timeItem_id;
                    })
                    const dayTimeTemp = data.dayTimes[dayTimeindex];
                    // Update time for day
                    dayTimeTemp.totalWorkingTime -= result.numOfHour;
                    dayTimeTemp.lackTime = 480 - dayTimeTemp.totalWorkingTime >= 0 ? 480 - dayTimeTemp.totalWorkingTime : 0;
                    dayTimeTemp.overTime = dayTimeTemp.totalWorkingTime - 480 >= 0 ? dayTimeTemp.totalWorkingTime - 480 : 0;

                    //Update time for month
                    data.totalWorkingTime_M -= result.numOfHour;
                    data.lackTime_M = data.userId.numMandatoryDay * 8 * 60 - data.totalWorkingTime_M >= 0 ? data.userId.numMandatoryDay * 8 * 60 - data.totalWorkingTime_M : 0;
                    data.overTime_M = data.totalWorkingTime_M - data.userId.numMandatoryDay * 8 * 60 >= 0 ? data.totalWorkingTime_M - data.userId.numMandatoryDay * 8 * 60 : 0;

                    dayTimeTemp.times.splice(timeItemIndex, 1);
                    data.save((err, doc) => {
                        if (err) {
                            console.log(err);
                        }
                        req.flash('confirmMember', `removed-${data._id}`)
                        res.redirect(`/confirm?member=${id_member}`)
                    })
                })
        })
}
module.exports.confirmMonth = (req, res, next) => {
    const monthId = req.body.id_month_confirm;
    const memberId = req.body.member_id;

    _TimeRecording.updateOne({ _id: monthId }, { isBlock: true })
        .then(result => {
            req.flash('confirmMember', `confirmed-`);
            res.redirect(`/confirm?member=${memberId}`)
        })
        .catch(err => console.log(err));
}
const insertMonth = async (req, month, year) => {
    let str_yearMonth = `${year}-${month.length === 1 ? +"0" + month : month}`;
    const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
    const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

    // timeRecording
    let monthTimeRecording = new _TimeRecording({
        year: parseInt(year),
        month: parseInt(month),
        numMandatoryDay: numOfMonthTemp - weekendOfMonth,
        isWorking: false,
        isBlock: false,
        userId: req.session.user._id,
    });

    // await monthTimeRecording.save();
    // await _User.updateOne({ _id: req.session.user._id, $push: { timeRecordings: { timeRecordingId: monthTimeRecording._id } } });
    // ============== Insert TimeItem====================
    let firstDayOfMonth = moment(str_yearMonth).startOf("month"); //Ngay bat dau
    let end = moment(str_yearMonth).endOf("month"); //Ngay ket thuc
    const arrEndTime = ["15:00", "14:00", "16:00", "16:30", "14:30"];
    const arrWorkPlace = ["Công ty", "Khách hàng", "Nhà"];
    const arrOffMonth = numWeekendOfMonth_List(str_yearMonth);

    //param total day
    let totalWorkingTime_M = 0;
    let dayTimes = [];
    while (firstDayOfMonth <= end) {
        if (arrOffMonth.indexOf(firstDayOfMonth.format("YYYY-MM-DD")) <= 0) {
            let a = moment(firstDayOfMonth.format("YYYY-MM-DD") + " " + "07:00"); //Mặc đinh bắt đầu lúc 7h
            let b = moment(firstDayOfMonth.format("YYYY-MM-DD") + " " + arrEndTime[Math.floor(Math.random() * arrEndTime.length)]); // Giờ kết thúc Random
            let workPlace = arrWorkPlace[Math.floor(Math.random() * arrWorkPlace.length)]; //Noi lam viec
            let workHour = b.diff(a, "minutes");
            //       Time Item
            let timeItemRecording = new _TimeItem({
                startTime: a,
                numOfHour: workHour,
                isLoading: false,
                workPlace: workPlace,
                endTime: b,
                timeRecordingId: monthTimeRecording._id,
            });
            let objectDayTime = {
                dayTime: firstDayOfMonth.format("YYYY-MM-DD"),
                times: [{ timeItemId: timeItemRecording._id }],
                totalWorkingTime: workHour,
                lackTime: 480 - workHour >= 0 ? 480 - workHour : 0,
                overTime: workHour - 480 >= 0 ? workHour - 480 : 0,
            };
            dayTimes.push(objectDayTime);
            totalWorkingTime_M += workHour;
            await timeItemRecording.save();
            firstDayOfMonth.add(1, "days");
        } else {
            firstDayOfMonth.add(1, "days");
        }
    }
    monthTimeRecording.totalWorkingTime_M = totalWorkingTime_M;
    monthTimeRecording.lackTime_M = (numOfMonthTemp - weekendOfMonth) * 8 * 60 - totalWorkingTime_M >= 0 ? (numOfMonthTemp - weekendOfMonth) * 8 * 60 - totalWorkingTime_M : 0;
    monthTimeRecording.overTime_M = totalWorkingTime_M - (numOfMonthTemp - weekendOfMonth) * 8 * 60 >= 0 ? totalWorkingTime_M - (numOfMonthTemp - weekendOfMonth) * 8 * 60 : 0;
    monthTimeRecording.dayTimes = dayTimes;
    await monthTimeRecording.save();
    await _User.updateOne({ _id: req.session.user._id }, { $push: { timeRecordings: { timeRecordingId: monthTimeRecording._id } } });

    return true;
};
//Func số ngày nghỉ của tháng... trả về tổng số ngày thứ 7 và chủ nhật của tháng
function numWeekendOfMonth(monthYear) {
    let firstDayOfMonth = moment(monthYear).startOf("month");
    let end = moment(monthYear).endOf("month");
    let temp = 0;
    while (firstDayOfMonth <= end) {
        if (firstDayOfMonth.format("dddd") === "Sunday" || firstDayOfMonth.format("dddd") === "Saturday") {
            temp++;
        }
        firstDayOfMonth.add(1, "days");
    }
    return temp;
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
//Func số ngày nghỉ của tháng... trả về tổng số ngày thứ 7 và chủ nhật của tháng tra ve Arr
function numWeekendOfMonth_List(monthYear) {
    let firstDayOfMonth = moment(monthYear).startOf("month");
    let end = moment(monthYear).endOf("month");
    let arr = []; //array ngay ghi
    //let temp = 0;
    while (firstDayOfMonth <= end) {
        if (firstDayOfMonth.format("dddd") === "Sunday" || firstDayOfMonth.format("dddd") === "Saturday") {
            arr.push(firstDayOfMonth.format("YYYY-MM-DD"));
            //temp++;
        }
        firstDayOfMonth.add(1, "days");
    }
    return arr;
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