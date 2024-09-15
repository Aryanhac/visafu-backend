const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const User = require('../Model/User');
const sendToken = require('../../utils/SendToken');
const cloudinary = require('cloudinary');
const twilio = require('twilio');
const generateOTP = require('../../utils/Otp');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);


//Register a User
const getOTP = catchAsyncError(async (req, res, next) => {
    const d = new Date();
    const phoneNumber = req.body.phoneNumber;
    const randomNumber = generateOTP();

    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
       return next(new ErrorHandling(400, "user not found"));
    } else {
        const message = `Hello from Fit4Sure! Your verification code is: ${randomNumber}`;

        const response = await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: "+91" + phoneNumber,
            body: message,
        });

        user.otp = {
            value: randomNumber,
            createdAt: d.getTime()
        }
        await user.save();
    }

    res.status(200).send({
        success: true
    });
});

//Otp Verification
const otpVerification = catchAsyncError(async (req, res, next) => {
    const { phoneNumber, otp } = req.body;
    const d = new Date();

    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
        return next(new ErrorHandling(400, "user not found"));
    }
    if (user.otp.value === otp && ((d.getTime() - user.otp.createdAt) / (1000 * 60 * 60 * 24)) < 1) {
        user.otp.createdAt = user.otp.createdAt - 1000 * 60 * 60 * 24;
        await user.save();
        sendToken(user, res, 200);
    } else {
        return res.status(400).json({ message: `The phone number and the OTP code doesn't match or OTP has expired.` });
    }
})


//logged Out
const logOut = catchAsyncError((req, res, next) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.json({
        success: true,
        message: "Successfully logged Out"
    })
})

//Get Profile
const getProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
    })
});



module.exports = { getOTP, logOut, getProfile, otpVerification };