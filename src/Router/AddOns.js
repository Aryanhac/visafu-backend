const express = require('express');
const { createAddOn, getAllAddOns, getAddOnById, updateAddOn, deleteAddOn } = require('../Controllers/AddOns');
const app = express.Router();


app.post('/createAddOns', isAuthentication,isAuthorizeRole("admin"), createAddOn); 
app.get('/getAddOns', getAllAddOns); 
app.get('/addons/:id', getAddOnById); 
app.put('/addons/:id',isAuthentication,isAuthorizeRole("admin"), updateAddOn); 
app.delete('/addons/:id',isAuthentication,isAuthorizeRole("admin"), deleteAddOn); 

module.exports = app;