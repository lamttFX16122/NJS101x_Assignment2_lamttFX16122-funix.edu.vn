const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const annualSchema = new Schema({
    startDateAnnual: {
        type: String,
        required: true
    },
    endDateAnnual: {
        type: String,
        required: true
    },
    timeAnnual: {
        type: Number,
        required: true
    },
    causeAnnual: {
        type: String,
        default: 'No reason'
    },
    dayOff: [String],
    isTimeAnnual: { //Nghi theo gio
        type: Boolean
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    // collection: 'annuals',
    timestamps: true
});
module.exports = mongoose.model('Annual', annualSchema);