const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeRecordingSchema = new Schema({
    dateTimeRecording: {
        type: Date,
        required
    },
    isWorking: {
        type: Boolean,
        default: false
    },
    totalWorkingTime: {
        type: Number,
        default: 0
    },
    lackTime: {
        type: Number,
        default: 0
    },
    overTime: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('TimeRecording', timeRecordingSchema);