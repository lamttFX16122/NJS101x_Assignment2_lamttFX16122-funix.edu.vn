const moment = require('moment');
const momentTZ = require('moment-timezone');
const _TimeRecording = require('../models/timeRecording.model');
const _User = require('../models/user.model');
const _TimeItem = require('../models/timeItem.model');
module.exports.getTimeRecording = (req, res, next) => {
    let isNew = false;
    _TimeRecording.findOne({
            userId: req.session.user._id,
            year: parseInt(moment().format('YYYY')),
            month: parseInt(moment().format('MM'))
        })
        .then(data => {
            if (!data) { //Neu la thang moi thi tao moi thang
                let str_yearMonth = `${moment().format('YYYY')}-${moment().format('MM').length === 1
                      ? +"0" + moment().format('MM'): moment().format('MM')}`;
                const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

                let item = new _TimeRecording({
                    year: parseInt(moment().format('YYYY')),
                    month: parseInt(moment().format('MM')),
                    numMandatoryDay: numOfMonthTemp - weekendOfMonth,
                    isWorking: false,
                    isBlock: false,
                    userId: req.session.user._id
                })
                isNew = true;
                return item.save();
            }
            return data;
        })
        .then(data => {
            if (isNew) { //Them timeRecording moi vao user
                return _User.updateOne({ _id: req.session.user._id, "$push": { timeRecordings: { timeRecordingId: data._id } } })
            }
            return data;
        })
        .then(data => {
            _TimeRecording.findOne({
                    userId: req.session.user._id,
                    year: parseInt(moment().format('YYYY')),
                    month: parseInt(moment().format('MM'))
                })
                .populate({
                    path: 'timeItems.timeItemId',
                    match: {
                        dayTime: { $eq: moment().format('YYYY-MM-DD').toString() }
                    }
                })

            .then(item => {
                    let monthInfo = {
                        isWorking: item.isWorking,
                        monthInfo_id: item._id
                    }
                    const timeItemIndex = item.timeItems.findIndex(i => {
                        return i.timeItemId !== null;
                    })
                    if (timeItemIndex >= 0 && item.timeItems[timeItemIndex].timeItemId !== null) {
                        const temp = item.timeItems[timeItemIndex].timeItemId;

                        monthInfo.dayTime = temp.dayTime;
                        monthInfo.totalWorkingTime = temp.totalWorkingTime;
                        monthInfo.lackTime = temp.lackTime;
                        monthInfo.overTime = temp.overTime;
                        monthInfo.times = temp.times.sort((a, b) => {
                            return b.startTime - a.startTime
                        });
                        monthInfo.day_id = temp._id;

                        if (temp.times.length > 0) {
                            const load = temp.times.findIndex(j => {
                                return j.isLoading === true;
                            })
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
                        monthInfo.times = []
                        monthInfo.isLoading = -1;
                        monthInfo.day_id = '';
                        monthInfo.newpie = false;
                    }
                    // console.log(monthInfo)
                    res.render('timeRecording/timeRecording.ejs', {
                        title: 'Điểm danh',
                        img_user: req.session.user.image,
                        numActive: 1,
                        timeItems: monthInfo,
                        moment: moment,
                        parseHour: parseHour
                    });
                })
                .catch(err => {
                    console.log(err)
                        //throw new Error(err)
                })
        })
        .catch(err => console.log(err));
}

module.exports.postTimeRecording = (req, res, next) => {
    const workPlace = req.body.workPlace;
    const month_id = req.body.month_id;
    const day_id = req.body.day_id;

    const time = {
        startTime: moment(),
        isLoading: true,
        workPlace: workPlace
    }
    if (day_id !== '') {

        _TimeItem.updateOne({ _id: day_id }, { '$push': { times: time } })
            .then(data => {
                res.redirect('/');
            })
            .catch(err => console.log(err));
    } else {
        const itemNew = new _TimeItem({
            times: [time],
            timeRecordingId: month_id
        })
        itemNew.save((err, doc) => {
            if (err) {
                console.log(err);
            }
            _TimeRecording.updateOne({ _id: month_id }, { '$push': { timeItems: { timeItemId: itemNew._id } } })
                .then(data => {
                    res.redirect('/');
                })
                .catch(err => console.log(err));
        });
    }
}
module.exports.postEndTime = (req, res, next) => {
    const month_id = req.body.month_id;
    const day_id = req.body.day_id;
    const item_id = req.body.item_id;
    let addTime = 0; // Bien luu thoi gian lam viec cua phien de cong don cho thang

    _TimeItem.findById(day_id)
        .then(data => {
            const index = data.times.findIndex(i => i._id == item_id);
            if (index < 0) {
                throw new Error('hihi');
            }
            let totalTime = moment().diff(data.times[index].startTime, 'minutes')
            data.times[index].endTime = moment();
            data.times[index].numOfHour = totalTime; //Phut
            data.times[index].isLoading = false;
            addTime = totalTime;
            //Set Total in day
            data.totalWorkingTime += totalTime; //Phut
            data.lackTime = (480 - data.totalWorkingTime) >= 0 ? (480 - data.totalWorkingTime) : 0;
            data.overTime = (data.totalWorkingTime - 480) >= 0 ? (data.totalWorkingTime - 480) : 0;

            return data.save();
        })
        .then(data => {
            //console.log(data)
            _TimeRecording.findById(month_id)
                .then(month => {
                    month.totalWorkingTime_M += addTime;
                    month.lackTime_M = month.numMandatoryDay * 8 * 60 - month.totalWorkingTime_M >= 0 ? month.numMandatoryDay * 8 * 60 - month.totalWorkingTime_M : 0;
                    month.overTime_M = month.totalWorkingTime_M - month.numMandatoryDay * 8 * 60 >= 0 ? month.totalWorkingTime_M - month.numMandatoryDay * 8 * 60 : 0;
                    return month.save();
                })
                .then(result => {
                    res.redirect('/');
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}


//Func số ngày nghỉ của tháng... trả về tổng số ngày thứ 7 và chủ nhật của tháng
function numWeekendOfMonth(monthYear) {
    let firstDayOfMonth = moment(monthYear).startOf("month");
    let end = moment(monthYear).endOf("month");
    let temp = 0;
    while (firstDayOfMonth <= end) {
        if (
            firstDayOfMonth.format("dddd") === "Sunday" ||
            firstDayOfMonth.format("dddd") === "Saturday"
        ) {
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