const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {getOTP,logOut,otpVerification,getProfile,updateProfile,getAllUsers,getSingleUser,updateUserRole,deleteUser}=require('../Controllers/User');
app.post('/getOTP',getOTP);
app.post('/otpVerification',otpVerification);
app.get('/logOut',logOut);
app.get('/profile',isAuthentication,getProfile);
app.post('/profile/update',isAuthentication,updateProfile);
app.get('/admin/users',isAuthentication,isAuthorizeRole("admin"),getAllUsers);
app.route('/admin/user/:id').get(isAuthentication,isAuthorizeRole("admin"),getSingleUser).put(isAuthentication,isAuthorizeRole("admin"),updateUserRole).delete(isAuthentication,isAuthorizeRole("admin"),deleteUser);


module.exports=app;