const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
    url: { type: String, required: true }, // URL or file path of the photo
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);