const https=require('https');
const fs = require('fs'); // For reading certificate and key files
const app=require('./src/app');
const database=require('./config/database');

// Paths to your SSL certificate and private key
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.visafu.com/privkey.pem'),
   cert: fs.readFileSync('/etc/letsencrypt/live/api.visafu.com/fullchain.pem')
};


//uncaughtException Error
process.on('uncaughtException',(err)=>{
    console.log(`Error:${err}`);
    console.log('uncaughtException Error so, shutdown the PROCESS');
    server.close(()=>{
        process.exit();
    })
})

const server = https.createServer(options, app);

//connecting to database
const con=database();
con.then((message)=>{
    console.log(message);
    server.listen(process.env.PORT,()=>{
        console.log(`Server is working on ${process.env.PORT}`);
    });
}).catch((message)=>{
    console.log(message);
})



// unhandledRejection Error
process.on('unhandledRejection',(err)=>{
    console.log(err);
    console.log('unhandledRejection Error so, shutdown the PROCESS');
    server.close(()=>{
        process.exit();
    })
})