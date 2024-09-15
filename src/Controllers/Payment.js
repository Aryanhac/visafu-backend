const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const crypto = require('crypto');
const axios = require('axios');
const Client = require('../Model/Client');


const newPayment = catchAsyncError(async (req, res, next) => {
    const merchantTransactionId = 'M' + Date.now();
    const { name } = req.body;

    const data = {
        merchantId: process.env.MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: 'MUID' + user._id,
        name: name,
        amount: price * 100,
        redirectUrl: `http://localhost:3000/api/checkStatus/${merchantTransactionId}`,
        redirectMode: 'POST',
        mobileNumber: phone,
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + process.env.SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
    const options = {
        method: 'POST',
        url: prod_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payloadMain
        }
    };
    axios.request(options).then(function (response) {
        return res.status(200).send({ url: response.data.data.instrumentResponse.redirectInfo.url })
    })
        .catch(function (error) {
            console.error(error);
        });
});

const checkStatus = catchAsyncError(async (req, res, next) => {
    const merchantTransactionId = req.params['txnId']
    const merchantId = process.env.MERCHANT_ID
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };
    // CHECK PAYMENT STATUS
    axios.request(options).then(async (response) => {
        if (response.data.success === true) {

            const result = await Client.updateOne(
                {
                    "paymentHistory.merchantTransactionId": response.data.data.merchantTransactionId
                },
                {
                    $set: {
                        "paymentHistory.$.status": "done"
                    }
                }
            );
            

            return  res.redirect('http://localhost:3000/thankyou');
        } else {
            return res.status(400).send({ success: false, message: "Payment Failure" });
        }
    })
        .catch((err) => {
            res.status(500).send({ msg: err.message });
        });
});

module.exports = { newPayment, checkStatus }