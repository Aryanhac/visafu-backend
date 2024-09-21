const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {sendOtp, verifyOtp} = require('../Controllers/User');

app.post('/sendOtp', sendOtp);
app.post('/verifyOtp',verifyOtp);


module.exports=app;