const express =require('express');
const cookieParser=require('cookie-parser');
const errorMiddleware =require('../middleware/error');
const app=express();
const fileupload = require('express-fileupload');
var cors = require('cors')

//Config
if(process.env.NODE_ENV!=='Production'){
    require('dotenv').config({path:'./config/config.env'});
}



//middleware
app.use(cors({
    origin: '*',
    credentials: true }));
    
app.use(fileupload());
app.use(express.json({limit:"1000kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Router
const user=require('../src/Router/User');
const visa = require('../src/Router/Visa');
const visaApplied = require('../src/Router/VisaApplied');
const addOns = require('../src/Router/AddOns');
const testimonial = require('../src/Router/Testimonial');

app.use('/api',user);
app.use('/api',visa);
app.use('/api',visaApplied);
app.use('/api', addOns);
app.use('/api',testimonial);

//Error middleware
app.use(errorMiddleware);
module.exports=app;