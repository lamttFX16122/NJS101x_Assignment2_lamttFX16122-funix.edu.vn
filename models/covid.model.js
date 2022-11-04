const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const covidSchema = new Schema({
    hypothermia: [{
        dateHypothermia: Date,
        timeHypothermia: String,
        temperature: Number,
        affection: String
    }],
    vaccine: [{
        dateVaccine: Date,
        numVaccine: Number,
        typeVaccine: String
    }],
    covid: [{
        numCovid: Number,
        dateCovid: Date,
        statusCovid: Boolean
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'covids',
    timestamps: true
});
module.exports = mongoose.model('Covid', covidSchema);