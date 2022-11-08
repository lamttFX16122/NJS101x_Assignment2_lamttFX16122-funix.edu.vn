const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    listEmploys: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
})