const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const timeRecordingSchema = new Schema(
    {
        year: {
            type: Number,
            required: true,
        },
        month: {
            type: Number,
            required: true,
        },
        isWorking: {
            type: Boolean,
            default: false,
        },
        isBlock: {
            type: Boolean,
            default: false,
        },
        numMandatoryDay: {
            type: Number,
            required: true,
        },
        totalWorkingTime_M: {
            type: Number,
            default: 0,
        },
        lackTime_M: {
            type: Number,
            default: 0,
        },
        overTime_M: {
            type: Number,
            default: 0,
        },
        dayTimes: [
            {
                dayTime: {
                    type: String,
                    default: moment().format("YYYY-MM-DD"),
                },
                times: [
                    {
                        timeItemId: {
                            type: Schema.Types.ObjectId,
                            ref: "TimeItem",
                        },
                    },
                ],
                totalWorkingTime: {
                    type: Number,
                    default: 0,
                },
                lackTime: {
                    type: Number,
                    default: 0,
                },
                overTime: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        annuals: [
            {
                annualId: {
                    type: Schema.Types.ObjectId,
                    ref: "Annual",
                },
            },
        ],
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        // collection: 'timeRecordings',
        timestamps: true,
    }
);

module.exports = mongoose.model("TimeRecording", timeRecordingSchema);
