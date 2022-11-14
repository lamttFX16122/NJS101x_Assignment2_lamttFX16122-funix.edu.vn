const express = require("express");
const _TimeRecording = require("../controllers/timeRecording.controller");
const isAuth = require("../Middleware/is-auth");
const route = express.Router();

route.get("/", isAuth.isUser, _TimeRecording.getTimeRecording);
// Start Time
route.post("/startTime", isAuth.isUser, _TimeRecording.postTimeRecording);
//End time
route.post("/end-time", isAuth.isUser, _TimeRecording.postEndTime);

// Insert TimeRecording
// route.get("/insert", isAuth.isUser, _TimeRecording.insertTimeRecording);
module.exports = route;
