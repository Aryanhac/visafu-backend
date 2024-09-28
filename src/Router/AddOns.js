const express = require('express');
const { createAddOn, getAllAddOns, getAddOnById, updateAddOn, deleteAddOn } = require('./addOnController');
const app = express.app();


app.post('/addons', createAddOn); 
app.get('/addons', getAllAddOns); 
app.get('/addons/:id', getAddOnById); 
app.put('/addons/:id', updateAddOn); 
app.delete('/addons/:id', deleteAddOn); 

module.exports = app;