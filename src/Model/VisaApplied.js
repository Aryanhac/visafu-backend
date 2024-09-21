const mongoose = require('mongoose');
const { Schema } = mongoose;

const visaAppliedSchema = new Schema({
    visaNumber: { type: String, required: true },
    country: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visa', visaAppliedSchema);