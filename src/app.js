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
app.use(express.json({limit:"100kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Router
const user=require('../src/Router/User');

app.use('/api',user);;





// File upload route
// const upload = require('../utils/uploadImage')
// app.post('/upload', upload.single('image'), (req, res) => {
//     res.send({
//       message: 'Image uploaded successfully!',
//       imageUrl: req.file.location, // S3 URL for the uploaded file
//     });
// });
  
//Error middleware
app.use(errorMiddleware);
module.exports=app;