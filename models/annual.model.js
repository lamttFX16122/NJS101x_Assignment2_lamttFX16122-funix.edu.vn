const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const annualSchema = new Schema({
    startDateAnnual: {
        type: Date,
        required
    },
    endDateAnnual: {
        type: Date,
        required
    },
    timeAnnual: {
        type: Number,
        required
    },
    causeAnnual: {
        type: String,
        default: 'No reason'
    },
    isTimeAnnual: { //Nghi theo gio
        type: Boolean
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'annuals',
    timestamps: true
});
module.exports = mongoose.model('Annual', annualSchema);