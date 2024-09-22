const User = require('../Model/User');
const Passport = require('../Model/Passport');
const Photo = require('../Model/Photo');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const generateOTP = require('../../utils/Otp');
const { snsClient, PublishCommand } = require('../../utils/AWS/SNS');
const sendToken = require('../../utils/SendToken');
// const SendMail = require('../../utils/SendMail');
const upload = require('../../utils/uploadImage');



// sendOtp || signUp
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
            return res.status(500).send({
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


// for verify Otp
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

    sendToken(user, res, 200);
})

//logged Out
const logOut = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.json({
        success: true,
        message: "Successfully logged Out"
    })
})

// const sendEmail = catchAsyncError(async (req, res, next) => {
//     let options = {
//         to: "ag98974461@gmail.com",
//         subject: "Visa Fu",
//         message: "hi Aryan, I'm from visafu"
//     }

//     SendMail(options, res);
// })

const updateProfile = catchAsyncError(async (req, res, next) => {
    const { email, passportDetails } = req.body;

    const user = req.user;

    if (email) {
        user.email = email;
    }

    // Step 4: Handle passport update (optional)
    let passportId = user.passportId;
    if (passportDetails && (req.files['passportFront'] || req.files['passportBack'])) {
        // If passport details or images are provided, update/create the passport record

        // Step 4.1: Upload passport front and back images if provided
        let frontImageUrl, backImageUrl;
        if (req.files['passportFront']) {
            frontImageUrl = await upload.single(req.files['passportFront'][0]);
        }
        if (req.files['passportBack']) {
            backImageUrl = await upload.single(req.files['passportBack'][0]);
        }

        // Step 4.2: Check if passport already exists or create a new one
        let passport = passportId ? await Passport.findById(passportId) : new Passport();

        // Step 4.3: Update passport images and details (if provided)
        if (frontImageUrl) passport.frontImage = frontImageUrl;
        if (backImageUrl) passport.backImage = backImageUrl;

        if (passportDetails) {
            passport.details = {
                passportIssuedOn: passportDetails.passportIssuedOn || passport.details.passportIssuedOn,
                passportValidTill: passportDetails.passportValidTill || passport.details.passportValidTill,
                passportNumber: passportDetails.passportNumber || passport.details.passportNumber,
                fatherName: passportDetails.fatherName || passport.details.fatherName,
                motherName: passportDetails.motherName || passport.details.motherName,
                dob: passportDetails.dob || passport.details.dob,
                gender: passportDetails.gender || passport.details.gender,
                firstName: passportDetails.firstName || passport.details.firstName,
                lastName: passportDetails.lastName || passport.details.lastName
            };
        }

        // Step 4.4: Save passport and set the passportId for user
        await passport.save();
        passportId = passport._id;
    }

    // Step 5: Handle photo update (optional)
    let photoId = user.photoId;
    if (req.files['photo']) {
        // Step 5.1: Upload photo and create/update photo record
        const photoImageUrl = await uploadToS3(req.files['photo'][0]);

        let photo = photoId ? await Photo.findById(photoId) : new Photo();
        photo.image = photoImageUrl;
        await photo.save();

        photoId = photo._id;
    }

    // Step 6: Update the user's passportId and photoId if needed
    if (passportId) {
        user.passportId = passportId;
    }
    if (photoId) {
        user.photoId = photoId;
    }

    // Step 7: Save the updated user
    await user.save();

    // Respond with the updated user details
    res.status(200).json({
        message: 'Profile updated successfully',
        user
    });
})


module.exports = { verifyOtp, sendOtp, logOut, updateProfile };