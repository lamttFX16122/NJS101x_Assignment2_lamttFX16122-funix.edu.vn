const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required
    },
    userName: {
        type: String,
        required
    },
    doB: {
        type: Date,
        required
    },
    salaryScale: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required
    },
    department: {
        type: String,
        required
    },
    annualLeave: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    annualId: {
        type: Schema.Types.ObjectId,
        ref: 'Annual'
    },
    timeRecordingId: {
        type: Schema.Types.ObjectId,
        ref: 'TimeRecording'
    },
    covidId: {
        type: Schema.Types.ObjectId,
        ref: 'Covid'
    }
}, {
    collection: 'users',
    timestamps: true
})
module.exports = mongoose.model('User', userSchema);