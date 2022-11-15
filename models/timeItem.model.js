const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const timeItemSchema = new Schema(
    {
        startTime: {
            type: Date,
            default: moment(),
        },
        endTime: {
            type: Date,
        },
        numOfHour: {
            type: Number,
            default: 0,
        },
        isLoading: {
            type: Boolean,
            default: true,
        },
        workPlace: {
            type: String,
            required: true,
        },
        timeRecordingId: {
            type: Schema.Types.ObjectId,
            ref: "TimeRecording",
        },
    },
    {
        // collection: "timeItems",
        timestamps: false,
    }
);

module.exports = mongoose.model("TimeItem", timeItemSchema);
