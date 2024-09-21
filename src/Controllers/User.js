const User = require('../Model/User');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const generateOTP = require('../../utils/Otp');
const {snsClient, PublishCommand} = require('../../utils/AWS/SNS');
const sendToken=require('../../utils/SendToken');


const sendOtp = catchAsyncError(async (req, res, next) => {
    const { mobile } = req.body;

    if (!mobile) {
        return next(new ErrorHandling(400, "mobile number is required"));
    }

    const otp = generateOTP();

    let user = await User.findOne({ mobile });

    // If user doesn't exist, create a new one
    if (!user) {
        user = new User({ mobile, otp, otpCreatedAt: new Date() });
    } else {
        user.otp = otp;
        user.otpCreatedAt = new Date();
    }

    await user.save();


    const params = {
        Message: `Your VisaFu verification OTP is: ${otp}. This code will expire in 1 minute`,
        PhoneNumber: `+${mobile}`,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            }
        }
    };


    const command = new PublishCommand(params);

    snsClient.send(command)
    .then((result) => {
        return res.status(200).send({
            message: 'OTP send successfully'
        })
    })
    .catch((error) => {
        return res.status(200).send({
            message: 'Error Sending OTP'
        })
    });

});



// check OTP validity
const isOtpExpired = (otpCreatedAt) => {
    const now = new Date();
    const diff = (now - otpCreatedAt) / 1000; // Difference in seconds
    return diff > 75; // 1 min 15 seconds = 75 seconds
};


const verifyOtp = catchAsyncError(async (req, res, next) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return next(new ErrorHandling(400, "mobile number or otp is required"));
    }


    const user = await User.findOne({ mobile });

    if (!user) {
        return next(new ErrorHandling(400, "user not found"));
    }

    if (isOtpExpired(user.otpCreatedAt)) {
        return next(new ErrorHandling(400, "otp is expired"));;
    }

    if (user.otp !== otp) {
        return next(new ErrorHandling(400, "invalid otp"));;
    }

    sendToken(user,res,200);
})



module.exports = { verifyOtp, sendOtp };