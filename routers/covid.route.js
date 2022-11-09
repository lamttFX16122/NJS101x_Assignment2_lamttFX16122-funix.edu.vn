const express = require("express");
const { body } = require("express-validator");
const _Covid = require("../controllers/covid.controller");
const _Auth = require("../Middleware/is-auth");
const route = express.Router();

//Get Covid
route.get("/covid", _Auth.isUser, _Covid.getCovid);
//Add Hypothermia
route.post("/hypothermia", _Auth.isUser, _Covid.postHypothermia);
//Edit Hypothermia
route.post("/edit-hypothermia", _Auth.isUser, _Covid.editHypothermia);
//Remove Hypothermia
route.post("/remove-hypothermia", _Auth.isUser, _Covid.removeHypothermia);

module.exports = route;
