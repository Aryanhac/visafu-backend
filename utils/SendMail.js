const nodemailer=require('nodemailer');
const SendMail=async (options)=>{
       const transporter=nodemailer.createTransport({
           service:process.env.EMAIL_SERVICE,
           auth:{
               user:process.env.EMAIL_USER,
               pass:process.env.EMAIL_PASSWORD
           }
       });
       const mailOptions={
           from:process.env.EMAIL_USER,
           to:options.email,
           subject:options.subject,
           text:options.message
       }
      await transporter.sendMail(mailOptions); 
}
module.exports=SendMail;