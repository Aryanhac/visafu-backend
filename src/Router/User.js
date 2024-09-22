const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {sendOtp, verifyOtp, logOut, updateProfile} = require('../Controllers/User');

app.post('/sendOtp', sendOtp);
app.post('/verifyOtp',verifyOtp);
app.get('/logOut',logOut);
app.update('/updateProfile',isAuthentication, updateProfile);


module.exports=app;