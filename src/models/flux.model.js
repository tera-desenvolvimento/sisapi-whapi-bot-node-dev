const mongoose = require('mongoose');

const fluxSchema = new mongoose.Schema({
    chatId: {
        type: String,
        unique: true,
        required: true,
    },
    step: {
        type: String,
        required: true
    },
    requestData: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Flux = mongoose.model('Flux', fluxSchema);

module.exports = Flux;