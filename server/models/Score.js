const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    username: { type: String, required: true },
    points: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
