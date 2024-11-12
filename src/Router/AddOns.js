const express = require('express');
const { createAddOn, getAllAddOns, getAddOnById, updateAddOn, deleteAddOn } = require('../Controllers/AddOns');
const app = express.Router();


app.post('/createAddOns', createAddOn); 
app.get('/getAddOns', getAllAddOns); 
app.get('/addons/:id', getAddOnById); 
app.put('/addons/:id', updateAddOn); 
app.delete('/addons/:id', deleteAddOn); 

module.exports = app;