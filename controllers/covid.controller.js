const moment = require("moment");
const flash = require("connect-flash");
const { validationResult } = require("express-validator");
const _User = require("../models/user.model");
const _Covid = require("../models/covid.model");

module.exports.getCovid = (req, res, next) => {
    let flashMes = req.flash("Covid");
    if (flashMes.length > 0) {
        flashMes = flashMes[0];
    }
    _Covid
        .findOne({ userId: req.session.user._id })
        .then((data) => {
            if (data) {
                data.hypothermia.sort((a, b) => {
                    return moment(b.dateHypothermia) - moment(a.dateHypothermia);
                });

                data.vaccine.sort((a, b) => {
                    return moment(b.dateVaccine) - moment(a.dateVaccine);
                });

                data.covid.sort((a, b) => {
                    return moment(b.dateCovid) - moment(a.dateCovid);
                });
            }

            res.render("covid/covid.ejs", {
                title: "Covid",
                img_user: req.session.user.image,
                numActive: 4,
                moment: moment,
                flashMes: flashMes,
                data: data,
                // remainAnnual: annualLeave,
                // registeredTime: req.session.user.initialAnnual - annualLeave,
                // parseHour: parseHour
            });
        })
        .catch((err) => console.log(err));
};

module.exports.postHypothermia = (req, res, next) => {
    const dateHypothermia = req.body.dateHypothermia;
    const timeHypothermia = req.body.timeHypothermia;
    const temperature = req.body.temperatureHypothermia;
    const affection = req.body.affection;
    const hypothermia = {
        dateHypothermia: dateHypothermia,
        timeHypothermia: timeHypothermia,
        temperature: temperature,
        affection: affection,
    };
    _Covid
        .findOne({ userId: req.session.user._id })
        .then((data) => {
            if (!data) {
                const newCovid = new _Covid({
                    hypothermia: [hypothermia],
                    vaccine: [],
                    covid: [],
                    userId: req.session.user._id,
                });
                newCovid.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    _User
                        .updateOne({ _id: req.session.user._id }, { covidId: doc._id })
                        .then((result) => {
                            req.flash("Covid", "Covidadded");
                            res.redirect("/covid");
                        })
                        .catch((err) => console.log(err));
                });
            }
            data.hypothermia.push(hypothermia);
            data.save((err, _doc) => {
                if (err) {
                    console.log(err);
                }
                req.flash("Covid", "Covidadded");
                res.redirect("/covid");
            });
        })
        .catch((err) => console.log(err));
};

module.exports.editHypothermia = (req, res, next) => {
    const dateHypothermia = req.body.dateHypothermia;
    const timeHypothermia = req.body.timeHypothermia;
    const temperature = req.body.temperatureHypothermia;
    const affection = req.body.affection;
    const _idCovid = req.body.covid_id;
    const _idHypothermia = req.body.hypothermia_id;

    _Covid
        .findById(_idCovid)
        .then((data) => {
            const index = data.hypothermia.findIndex((i) => {
                return i._id == _idHypothermia;
            });
            if (index >= 0) {
                const temp = data.hypothermia[index];
                temp.timeHypothermia = timeHypothermia;
                temp.dateHypothermia = dateHypothermia;
                temp.temperature = temperature;
                temp.affection = affection;
                return data.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    req.flash("Covid", "Covidedited");
                    res.redirect("/covid");
                });
            }
            req.flash("Covid", "Lỗi SEVER");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
module.exports.removeHypothermia = (req, res, next) => {
    const _idCovid = req.body.removecovid_id;
    const _idHypothermia = req.body.id_removeHypothermia;

    _Covid
        .updateOne({ _id: _idCovid }, { $pull: { hypothermia: { _id: _idHypothermia } } })
        .then((result) => {
            req.flash("Covid", "Coviddeleted");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
