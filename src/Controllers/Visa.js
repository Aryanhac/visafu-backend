const Visa = require('../Model/Visa');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const uploadFiletoS3 = require('../../utils/uploadFile');
const base64ToBuffer = require('../../utils/Base64ToBuffer');


const createVisa = catchAsyncError(async (req, res, next) => {

    // Handle base64 images for visa and card
    const visaImage = req.body.visaImage ? await uploadFiletoS3({...base64ToBuffer(req.body.visaImage), name: "visaImage"}) : null;
    const cardImage = req.body.cardImage ? await uploadFiletoS3({...base64ToBuffer(req.body.cardImage), name: "cardImage"}) : null;

    // Handle base64 images for reviews if they exist
    const reviews = req.body.reviews || [];
    const reviewImages = await Promise.all(
        reviews.map(async (review) => {
            if (review.image) {
                const imageBuffer = base64ToBuffer(review.image);
                return await uploadFiletoS3({...imageBuffer, name: "reviewImage"});
            }
            return null; // Default to null if no image
        })
    );

    const processedReviews = reviews.map((review, index) => ({
        ...review,
        image: reviewImages[index] // Associate uploaded image URL
    }));

    let totalRating = 0;
    processedReviews.forEach(review => {
        totalRating += Number(review.rating);
    });

    const overallRating = processedReviews.length > 0 ? totalRating / processedReviews.length : 0;

    const visa = new Visa({
        ...req.body,
        visaImage,
        cardImage,
        reviews: processedReviews,
        overallRating
    });

    const savedVisa = await visa.save();
    res.status(201).json(savedVisa);
});

const getAllVisas = catchAsyncError(async (req, res, next) => {
    const { countryName, city } = req.query;

    const filter = {};
    if (countryName) filter.countryName = countryName;
    if (city) filter.city = city;

    const visas = await Visa.find(filter);
    res.status(200).json(visas);
});

const getAllVisasCard = catchAsyncError(async (req, res, next) => {
    const { countryName, city } = req.query;

    const filter = {};
    if (countryName) filter.countryName = countryName;
    if (city) filter.city = city;

    const visas = await Visa.find(filter).select('deliverDays cardHeading cardImage city visaType price countryName');
    res.status(200).json(visas);
});

const getVisaById = catchAsyncError(async (req, res, next) => {
    const visa = await Visa.findById(req.params.id);
    if (!visa) return next(new ErrorHandling(400, "Visa not found"));
    res.status(200).json(visa);
});

const updateVisa = catchAsyncError(async (req, res, next) => {
    const visa = await Visa.findById(req.params.id);
    if (!visa) return next(new ErrorHandling(400, "Visa not found"));

    // Update images if provided in base64
    if (req.body.visaImage) {
        const visaImageBuffer = base64ToBuffer(req.body.visaImage);
        visa.visaImage = await uploadFiletoS3(visaImageBuffer);
    }
    if (req.body.cardImage) {
        const cardImageBuffer = base64ToBuffer(req.body.cardImage);
        visa.cardImage = await uploadFiletoS3(cardImageBuffer);
    }

    // Handle review images
    const reviews = req.body.reviews || [];
    const reviewImages = await Promise.all(
        reviews.map(async (review) => {
            if (review.image) {
                const imageBuffer = base64ToBuffer(review.image);
                return await uploadFiletoS3(imageBuffer);
            }
            return null; // Default to null if no image
        })
    );

    // Update review images and other details
    visa.reviews = reviews.map((review, index) => ({
        ...review,
        image: reviewImages[index]
    }));

    // Update other fields
    Object.assign(visa, req.body);

    const updatedVisa = await visa.save();
    res.status(200).json(updatedVisa);
});

const deleteVisa = catchAsyncError(async (req, res, next) => {
    const visa = await Visa.findByIdAndDelete(req.params.id);
    if (!visa) return next(new ErrorHandling(400, "Visa not found"));
    res.status(200).json({ message: 'Visa deleted successfully' });
});

module.exports = { createVisa, getAllVisas, getAllVisasCard, getVisaById, updateVisa, deleteVisa };