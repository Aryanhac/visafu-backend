const mongoose = require('mongoose');
const { Schema } = mongoose;

const passportSchema = new Schema({
    passportNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Passport', passportSchema);