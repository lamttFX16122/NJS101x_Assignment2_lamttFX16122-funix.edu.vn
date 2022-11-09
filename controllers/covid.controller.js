const moment = require("moment");
const flash = require("connect-flash");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const _User = require("../models/user.model");
const _Covid = require("../models/covid.model");
const doc = require("pdfkit");

module.exports.getCovid = (req, res, next) => {
    let _activeTab = 0;
    let flashMes = req.flash("Covid");
    if (flashMes.length > 0) {
        flashMes = flashMes[0];
        if (flashMes.includes("Vac")) {
            _activeTab = 1;
        }
        if (flashMes.includes("Covid")) {
            _activeTab = 2;
        }
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
                _activeTab: _activeTab,
            });
        })
        .catch((err) => console.log(err));
};

// ================= Hypothermia=================
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
                            req.flash("Covid", "Hypothermia_added");
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
                req.flash("Covid", "Hypothermia_added");
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
                    req.flash("Covid", "Hypothermia_adited");
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
            req.flash("Covid", "Hypothermia_deleted");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
// ================= End Hypothermia=============

// ================= Vaccine ====================
module.exports.postVaccine = (req, res, next) => {
    const numVac = req.body.numVac;
    const dateVac = req.body.dateVac;
    const typeVac = req.body.typeVac;
    const newVac = {
        dateVaccine: dateVac,
        numVaccine: numVac,
        typeVaccine: typeVac,
    };
    _Covid
        .findOne({ userId: req.session.user._id })
        .then((data) => {
            if (!data) {
                const newCovid = new _Covid({
                    hypothermia: [],
                    vaccine: [newVac],
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
                            req.flash("Covid", "Vac_added");
                            res.redirect("/covid");
                        })
                        .catch((err) => console.log(err));
                });
            }
            data.vaccine.push(newVac);
            data.save((err, _doc) => {
                if (err) {
                    console.log(err);
                }
                req.flash("Covid", "Vac_added");
                res.redirect("/covid");
            });
        })
        .catch((err) => console.log(err));
};
module.exports.postEditVaccine = (req, res, next) => {
    const numVac = req.body.numVac;
    const dateVac = req.body.dateVac;
    const typeVac = req.body.typeVac;

    const _covidId = req.body.vac_covid_id;
    const _vacId = req.body.vac_id;

    _Covid
        .findById(_covidId)
        .then((data) => {
            const index = data.vaccine.findIndex((i) => {
                return i._id == _vacId;
            });
            if (index >= 0) {
                const temp = data.vaccine[index];
                temp.dateVaccine = dateVac;
                temp.numVaccine = numVac;
                temp.typeVaccine = typeVac;

                return data.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    req.flash("Covid", "Vac_edited");
                    res.redirect("/covid");
                });
            }
            req.flash("Covid", "Lỗi SEVER");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
module.exports.postRemoveVaccine = (req, res, next) => {
    const _covidId = req.body.remove_Covid_id;
    const _vacId = req.body.remove_Vac_id;
    _Covid
        .updateOne({ _id: _covidId }, { $pull: { vaccine: { _id: _vacId } } })
        .then((result) => {
            req.flash("Covid", "Vac_deleted");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
// ================= End Vaccine ================

// ================= Covid ======================
module.exports.postCovid = (req, res, next) => {
    const _isCovid = req.body.check_isCovid === "on" ? true : false;
    const _numCovid = req.body.numCovid;
    const _dateCovid = req.body.dateCovid;
    const _symptomCovid = req.body.symptomCovid;

    const newIsCovid = {
        numCovid: _numCovid,
        dateCovid: _dateCovid,
        symptomCovid: _symptomCovid,
        statusCovid: _isCovid,
    };

    _Covid
        .findOne({ userId: req.session.user._id })
        .then((data) => {
            if (!data) {
                const newCovid = new _Covid({
                    hypothermia: [],
                    vaccine: [],
                    covid: [newIsCovid],
                    userId: req.session.user._id,
                });
                newCovid.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    _User
                        .updateOne({ _id: req.session.user._id }, { covidId: doc._id })
                        .then((result) => {
                            req.flash("Covid", "isCovid_added");
                            res.redirect("/covid");
                        })
                        .catch((err) => console.log(err));
                });
            }
            data.covid.push(newIsCovid);
            data.save((err, _doc) => {
                if (err) {
                    console.log(err);
                }
                req.flash("Covid", "isCovid_added");
                res.redirect("/covid");
            });
        })
        .catch((err) => console.log(err));
};
module.exports.postEditCovid = (req, res, next) => {
    const _isCovid = req.body.check_isCovid === "on" ? true : false;
    const _numCovid = req.body.numCovid;
    const _dateCovid = req.body.dateCovid;
    const _symptomCovid = req.body.symptomCovid;

    const _covidId = req.body.covid_id;
    const _isCovidId = req.body.isCovid_id;

    _Covid
        .findById(_covidId)
        .then((data) => {
            const index = data.covid.findIndex((i) => {
                return i._id == _isCovidId;
            });
            if (index >= 0) {
                const temp = data.covid[index];
                temp.numCovid = _numCovid;
                temp.dateCovid = _dateCovid;
                temp.symptomCovid = _symptomCovid;
                temp.statusCovid = _isCovid;
                return data.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    req.flash("Covid", "isCovid_edited");
                    res.redirect("/covid");
                });
            }
            req.flash("Covid", "Lỗi SEVER");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
module.exports.postRemoveCovid = (req, res, next) => {
    const _covidId = req.body.isCovid_id;
    const _isCovidId = req.body.remove_isCovid_id;
    _Covid
        .updateOne({ _id: _covidId }, { $pull: { covid: { _id: _isCovidId } } })
        .then((result) => {
            req.flash("Covid", "isCovid_deleted");
            res.redirect("/covid");
        })
        .catch((err) => console.log(err));
};
// ================= End Covid ==================

module.exports.exportCovidPDF = (req, res, next) => {
    _Covid
        .findOne({ userId: req.session.user._id })
        .then((data) => {
            if (!data) {
                // Chua co thong tin covid
            }
            const fileName = `covid_info_${req.session.user._id}_${moment().format("DDMMYYYYHHmmss")}.pdf`;
            const filePath = path.join("documentPDF", fileName);

            const docPdf = new PDFDocument({ size: "A4", margin: 50 });
            generateHypothermiaTable(docPdf, data.hypothermia);
            docPdf.end();
            docPdf.pipe(fs.createWriteStream(filePath));
            docPdf.pipe(res);

            // doc
        })
        .catch((err) => console.log(err));
};

// ================== Func custom PDF ====================
const generateHypothermiaTable = (doc, hypo) => {
    const marginTop = 300;

    doc.font("public/font/timesbd.ttf");
    // Table title
    generateTableRow(doc, marginTop, 13, "#", "Nhiệt độ", "Thời gian", "Tình trạng");
    // table content
    doc.font("public/font/times.ttf");
    hypo.forEach((item, index) => {
        const position = marginTop + (index + 1) * 20;
        generateTableRow(doc, position, 10, index + 1, item.temperature, `${item.timeHypothermia}-${moment(item.dateHypothermia).format("DD/MM/YYYY")}`, item.affection);
    });
};
const generateTableRow = (doc, y, fontsize, index, temperature, date, affection) => {
    doc.fontSize(fontsize).text(index, 50, y, { width: 10, align: "center" }).text(temperature, 70, y, { width: 80, align: "center" }).text(date, 120, y, { width: 150, align: "center" }).text(affection, 250, y);
};
// ================== End Func custom PDF ================
