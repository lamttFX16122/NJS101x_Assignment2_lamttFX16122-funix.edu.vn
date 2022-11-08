const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeRecordingSchema = new Schema({
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    isWorking: {
        type: Boolean,
        default: false
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    numMandatoryDay: {
        type: Number,
        required: true
    },
    totalWorkingTime_M: {
        type: Number,
        default: 0
    },
    lackTime_M: {
        type: Number,
        default: 0
    },
    overTime_M: {
        type: Number,
        default: 0
    },
    timeItems: [{
        timeItemId: {
            type: Schema.Types.ObjectId,
            ref: 'TimeItem'
        }
    }],
    annuals: [{
        annualId: {
            type: Schema.Types.ObjectId,
            ref: 'Annual'
        }
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    // collection: 'timeRecordings',
    timestamps: true
})

module.exports = mongoose.model('TimeRecording', timeRecordingSchema);