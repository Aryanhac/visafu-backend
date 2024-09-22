const nodemailer=require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});


const SendMail= (options, res)=>{
    const { to, subject, message, s3FileLink } = options;
    
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: to, 
      subject: subject, 
      text: message, 
    };

    if(s3FileLink){
        mailOptions["attachments"] = [
            {
              filename: 'visafu-invoice.pdf', 
              content: `Download the file using this link: ${s3FileLink}`, 
            },
        ];
    };
  
    transporter.sendMail(mailOptions)
    .then((info) => {
      return res.status(200).send({
        message: 'Email sent successfully',
        info, 
      });
    })
    .catch((error) => {
      return res.status(500).send({
        message: 'Failed to send email',
        error: error.message, 
      });
    });
}

module.exports=SendMail;