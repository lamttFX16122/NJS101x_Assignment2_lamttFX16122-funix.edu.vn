const express = require('express');
const _TimeRecording = require('../controllers/timeRecording.controller');
const isAuth = require('../Middleware/is-auth');
const route = express.Router();

route.get('/', isAuth, _TimeRecording.getTimeRecording);
// Start Time
route.post('/startTime', isAuth, _TimeRecording.postTimeRecording);
//End time
route.post('/end-time', isAuth, _TimeRecording.postEndTime);
module.exports = route;