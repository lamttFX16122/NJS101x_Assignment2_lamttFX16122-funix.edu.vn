const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        default: '12345'
    },
    userName: {
        type: String,
        required: true
    },
    doB: {
        type: Date,
        required: true
    },
    salaryScale: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    annualLeave: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    annuals: [{
        annualId: {
            type: Schema.Types.ObjectId,
            ref: 'Annual'
        }
    }],
    timeRecordings: [{
        timeRecordingId: {
            type: Schema.Types.ObjectId,
            ref: 'TimeRecording'
        }
    }],
    covidId: {
        type: Schema.Types.ObjectId,
        ref: 'Covid'
    }
}, {
    // collection: 'users',
    timestamps: true
})


// userSchema.methods.addTimeRecording=function(_id){
//     this.timeRecordingIds.push
//     // "$push": { "childrens": employee._id } 
// }
module.exports = mongoose.model('User', userSchema);