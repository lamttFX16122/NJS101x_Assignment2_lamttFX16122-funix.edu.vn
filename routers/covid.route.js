const express = require("express");
const { body } = require("express-validator");
const _Covid = require("../controllers/covid.controller");
const _Auth = require("../Middleware/is-auth");
const route = express.Router();

//Get Covid
route.get("/covid", _Auth.isUser, _Covid.getCovid);

// ============= Hypothermia================

//Add Hypothermia
route.post("/hypothermia", _Auth.isUser, _Covid.postHypothermia);
//Edit Hypothermia
route.post("/edit-hypothermia", _Auth.isUser, _Covid.editHypothermia);
//Remove Hypothermia
route.post("/remove-hypothermia", _Auth.isUser, _Covid.removeHypothermia);

// ============= End Hypothermia============

// ============= Vaccine====================
route.post("/vaccine", _Auth.isUser, _Covid.postVaccine);
route.post("/edit-vaccine", _Auth.isUser, _Covid.postEditVaccine);
route.post("/remove-vaccine", _Auth.isUser, _Covid.postRemoveVaccine);
// ============= End Vaccine================

// ============= Covid======================
route.post("/is-covid", _Auth.isUser, _Covid.postCovid);
route.post("/edit-covid", _Auth.isUser, _Covid.postEditCovid);
route.post("/remove-covid", _Auth.isUser, _Covid.postRemoveCovid);
// ============= End Covid==================

// ============= PDF Export=================
route.get("/pdf", _Auth.isAdmin, _Covid.exportCovidPDF);
// ============= End PDF Export=============

module.exports = route;
