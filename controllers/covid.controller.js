const moment = require("moment");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const _User = require("../models/user.model");
const _Covid = require("../models/covid.model");


module.exports.getCovid = async (req, res, next) => {
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
    if (req.session.user.isAdmin.admin) {
        _User.findById(req.session.user._id)
            .select('isAdmin.lstUser')
            .then(userData => {
                let lstUser = [];
                userData.isAdmin.lstUser.forEach(userItem => {
                    lstUser.push(userItem.memberId);
                });
                _User.find({ _id: { $in: lstUser } })
                    .populate('covidId')
                    .then(result => {
                        _Covid
                            .findOne({ userId: req.session.user._id })
                            .then((data) => {
                                if (!data) {
                                    const newCovid = new _Covid({
                                        hypothermia: [],
                                        vaccine: [],
                                        covid: [],
                                        userId: req.session.user._id
                                    })
                                    newCovid.save((err, doc) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                        _User.updateOne({ _id: req.session.user._id }, {
                                            covidId: doc._id
                                        }).then(result => {
                                            res.redirect('/covid');
                                        })
                                    });
                                } else {
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
                                    userData: result,
                                    _activeTab: _activeTab,
                                    isAdmin: req.session.user.isAdmin.admin
                                });
                            })
                            .catch((err) => console.log(err));
                    })
            })
            .catch((err) => console.log(err));
    }
    else {
        _Covid
            .findOne({ userId: req.session.user._id })
            .then((data) => {
                if (!data) {
                    const newCovid = new _Covid({
                        hypothermia: [],
                        vaccine: [],
                        covid: [],
                        userId: req.session.user._id
                    })
                    newCovid.save((err, doc) => {
                        if (err) {
                            console.log(err)
                        }
                        _User.updateOne({ _id: req.session.user._id }, {
                            covidId: doc._id
                        }).then(result => {
                            res.redirect('/covid');
                        })
                    });
                } else {
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
                    userData: null,
                    _activeTab: _activeTab,
                    isAdmin: req.session.user.isAdmin.admin
                });
            })
            .catch((err) => console.log(err));
    }

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
    const userId = req.query.userId;
    // console.log(userId)
    _Covid
        .findOne({ userId: userId })
        .populate('userId')
        .then((data) => {
            if (!data) {
                // Chua co thong tin covid
            }
            const fileName = `covid_info_${userId}_${moment().format("DDMMYYYYHHmmss")}.pdf`;
            const filePath = path.join("documentPDF", fileName);

            const docPdf = new PDFDocument({ size: "A4", margin: 50 });
            generateHeader(docPdf);
            generateUserInfo(docPdf, data.userId);
            generateHypothermiaTable(docPdf, data);
            docPdf.end();
            docPdf.pipe(fs.createWriteStream(filePath));
            res.type("application/pdf");
            //Dowload pdf
            // res.setHeader("Content-Disposition", 'attachment; filename="' + fileName + '"');
            // res.setHeader("Content-Disposition", 'inline; filename="' + fileName + '"');
            docPdf.pipe(res);
        })
        .catch((err) => console.log(err));
};
module.exports.printListPDF = (req, res, next) => {
    const userId = req.body.checkUserId;
    let arrUserId = [];
    if (typeof (userId) == 'string') {
        arrUserId = [userId];
    }
    else {
        arrUserId = userId
    }
    _User.find({ _id: { $in: arrUserId } })
        .populate('covidId')
        .then(data => {
            const fileName = `List_covid_info_${moment().format("DDMMYYYYHHmmss")}.pdf`;
            const filePath = path.join("documentPDF", fileName);

            const docPdf = new PDFDocument({ size: "A4", margin: 50 });
            data.forEach((userItem, index) => {
                generateHeader(docPdf);
                generateUserInfo(docPdf, userItem);
                generateHypothermiaTable(docPdf, userItem.covidId);

                if (index + 1 < data.length) {
                    docPdf.addPage();
                }
            })

            docPdf.end();
            docPdf.pipe(fs.createWriteStream(filePath));
            res.type("application/pdf");
            //Dowload pdf
            // res.setHeader("Content-Disposition", 'attachment; filename="' + fileName + '"');
            // res.setHeader("Content-Disposition", 'inline; filename="' + fileName + '"');
            docPdf.pipe(res);
        })
}
// ================== Func custom PDF ====================
const generateHeader = (doc) => {
    doc.font("public/font/timesbd.ttf").fontSize(20).text("THÔNG TIN KHAI BÁO COVID", { align: "center" }).moveDown();
};

const generateUserInfo = (doc, user) => {
    doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("15").text("NHÂN VIÊN", 50, 100);
    generateHr(doc, 125, 550);
    const userInfoTop = 140;

    doc.font("public/font/times.ttf")
        .fontSize(13)
        .text("Mã nhân viên: ", 50, userInfoTop)
        //_id
        .font("public/font/timesbd.ttf")
        .text(user._id, 150, userInfoTop)

        .font("public/font/times.ttf")
        .fontSize(13)
        // user Name
        .text("Họ và tên: ", 50, userInfoTop + 15)
        .text(user.userName, 150, userInfoTop + 15)
        // dob
        .text("Ngày sinh: ", 50, userInfoTop + 30)
        .text(moment(user.doB).format("DD/MM/YYYY"), 150, userInfoTop + 30)
        //department
        .text("Phòng ban: ", 50, userInfoTop + 45)
        .text(user.department, 150, userInfoTop + 45)

        //department
        .text("Ngày vào làm: ", 50, userInfoTop + 60)
        .text(moment(user.startDate).format("DD/MM/YYYY"), 150, userInfoTop + 60);
    generateHr(doc, userInfoTop + 90, 550);
};
const generateHypothermiaTable = (doc, data) => {
    let marginTop = 270;
    let marginTopNext = 0;
    let marginTopNextCovid = 0;
    // ===========Thông tin thân nhiệt=======================
    doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("15").text("Thông tin thân nhiệt", 50, marginTop);
    generateHr(doc, marginTop + 20, 550);
    doc.font("public/font/timesbd.ttf");
    if (data.hypothermia.length > 0) {
        // Table title
        generateTableRow_Hypo(doc, marginTop + 35, 13, "#", "Nhiệt độ", "Thời gian", "Tình trạng");

        generateHr(doc, marginTop + 60, 500);
        // table content
        doc.font("public/font/times.ttf");
        let _countHypo = 0;
        data.hypothermia.forEach((item, index) => {
            let position = marginTop + 60 + (_countHypo + 1) * 15;
            generateTableRow_Hypo(doc, position, 10, index + 1, item.temperature, `${item.timeHypothermia}-${moment(item.dateHypothermia).format("DD/MM/YYYY")}`, item.affection);
            generateHr(doc, position + 20, 500);
            marginTop += 20;
            marginTopNext = position + 20;
            _countHypo++;
            if (position > 650) {
                _countHypo = 0;
                marginTop = 20;
                doc.addPage();
            }
        });
    } else {
        doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("12").text("Chưa có thông tin thân nhiệt!", 50, marginTop + 30);
        marginTopNext = marginTop + 60;
    }

    // =========== End Thông tin thân nhiệt====================

    // =========== Thông tin Vaccine =========================
    let marginVaccine = marginTopNext + 10;

    doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("15").text("Thông tin Vaccine", 50, marginVaccine);
    generateHr(doc, marginVaccine + 20, 550);
    doc.font("public/font/timesbd.ttf");
    if (data.vaccine.length > 0) {
        // Table title
        generateTableRow_Vac(doc, marginVaccine + 35, 13, "#", "Mũi tiêm", "Thời gian", "Loại Vaccine");

        generateHr(doc, marginVaccine + 60, 500);
        // table content
        let _countVac = 0;
        doc.font("public/font/times.ttf");
        data.vaccine.forEach((item, index) => {
            const position = marginVaccine + 60 + (_countVac + 1) * 15;
            generateTableRow_Vac(doc, position, 10, index + 1, item.numVaccine, moment(item.dateVaccine).format("DD/MM/YYYY"), item.typeVaccine);
            generateHr(doc, position + 20, 500);
            marginVaccine += 20;
            marginTopNext = position + 20;
            _countVac++;
            if (position > 650) {
                _countVac = 0;
                marginVaccine = 20;
                doc.addPage();
            }
        });
    } else {
        doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("12").text("Chưa có thông tin tiêm Vaccine!", 50, marginVaccine + 30);
        marginTopNext = marginVaccine + 60;
    }

    // =========== End Thông tin Vaccinet =====================

    // =========== Is Covid ===================================

    marginTopNextCovid = marginTopNext + 10;
    doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("15").text("Thông tin dương tính Covid", 50, marginTopNextCovid);
    generateHr(doc, marginTopNextCovid + 20, 550);
    doc.font("public/font/timesbd.ttf");
    if (data.covid.length > 0) {
        // Table title
        generateTableRow_Covid(doc, marginTopNextCovid + 35, 13, "#", "Lần nhiễm", "Thời gian", "Tình trạng", "Triệu chứng");

        generateHr(doc, marginTopNextCovid + 60, 500);
        // table content
        doc.font("public/font/times.ttf");
        let _countCovid = 0; //set for newPage
        data.covid.forEach((item, index) => {
            const position = marginTopNextCovid + 60 + (_countCovid + 1) * 15;
            generateTableRow_Covid(doc, position, 10, index + 1, item.numCovid, moment(item.dateCovid).format("DD/MM/YYYY"), item.statusCovid === true ? "Đang nhiễm" : "Đã hết", item.symptomCovid);
            generateHr(doc, position + 20, 500);
            marginTopNextCovid += 20;
            _countCovid++;
            if (position > 650) {
                _countCovid = 0;
                marginTopNextCovid = 20;
                doc.addPage();
            }
        });
    } else {
        doc.fillColor("#444444").font("public/font/timesbd.ttf").fontSize("12").text("Chưa có thông tin tiêm Vaccine!", 50, marginTopNextCovid + 30);
        marginTopNext = marginTopNextCovid + 60;
    }


    // ===========  End Is Covid ==============================
};

const generateTableRow_Hypo = (doc, y, fontsize, index, temperature, date, affection) => {
    doc.fontSize(fontsize).text(index, 50, y, { width: 10, align: "center" }).text(temperature, 70, y, { width: 80, align: "center" }).text(date, 120, y, { width: 150, align: "center" }).text(affection, 250, y, { width: 300 });
};
const generateTableRow_Vac = (doc, y, fontsize, index, numVac, dateVac, typeVac) => {
    doc.fontSize(fontsize).text(index, 50, y, { width: 10, align: "center" }).text(numVac, 70, y, { width: 80, align: "center" }).text(dateVac, 120, y, { width: 150, align: "center" }).text(typeVac, 250, y, { width: 300 });
};
const generateTableRow_Covid = (doc, y, fontsize, index, numCovid, dateCovid, statusCovid, symptomCovid) => {
    doc.fontSize(fontsize).text(index, 50, y, { width: 10, align: "center" }).text(numCovid, 70, y, { width: 80, align: "center" }).text(dateCovid, 120, y, { width: 150, align: "center" }).text(statusCovid, 200, y, { width: 150, align: "center" }).text(symptomCovid, 340, y, { width: 300 });
};
const generateHr = (doc, y, sizeHr) => {
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(sizeHr, y).stroke();
};
// ================== End Func custom PDF ================
