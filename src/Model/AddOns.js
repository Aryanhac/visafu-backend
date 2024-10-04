const mongoose = require('mongoose');
const { Schema } = mongoose;

const addOnSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, 
    price: { type: Number, required: true },
    visaFuCharges: { type: String, required: true },
    tax: { type: String, required: true }
});

const AddOn = mongoose.model('AddOn', addOnSchema);

module.exports = AddOn;