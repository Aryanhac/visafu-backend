const Visa = require('../Model/Visa');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const uploadFiletoS3 = require('../../utils/uploadFile');

const createVisa = catchAsyncError(async (req, res, next) => {
    const visaImage = await uploadFiletoS3(req.files['visaImage']);
        const cardImage = await uploadFiletoS3(req.files['cardImage']);

        // Process review images
        const reviewImages = await Promise.all(
            req.files['reviewImages'].map(async (file) => await uploadFiletoS3(file))
        );
        
        // Construct reviews array with uploaded images
        const reviews = req.body.reviews.map((review, index) => ({
            ...review,
            image: reviewImages[index]
        }));

        const visa = new Visa({
            ...req.body,
            visaImage,
            cardImage,
            reviews,
        });

        const savedVisa = await visa.save();
        res.status(201).json(savedVisa);
})

const getAllVisas = catchAsyncError(async (req, res, next) => {
    const { countryName, city} = req.query;
        
    const filter = {};
    if (countryName) filter.countryName = countryName;
    if (city) filter.city = city;

    const visas = await Visa.find(filter);
    res.status(200).json(visas);
})

const getAllVisasCard = catchAsyncError(async (req, res, next) => {
    const { countryName, city} = req.query;
        
    const filter = {};
    if (countryName) filter.countryName = countryName;
    if (city) filter.city = city;

    const visas = await Visa.find(filter).select('deliverDays cardHeading cardImage city visaType price countryName');
    res.status(200).json(visas);
})

const getVisaById = catchAsyncError(async (req,res,next)=>{
    const visa = await Visa.findById(req.params.id);
    if (!visa) return next(new ErrorHandling(400, "Visa not found"));
    res.status(200).json(visa);
})

const updateVisa = catchAsyncError(async (req,res,next)=>{
    const visa = await Visa.findById(req.params.id);
        if (!visa) return next(new ErrorHandling(400, "Visa not found"));

        // Upload new images if provided
        if (req.files['visaImage']) {
            const visaImage = await uploadFiletoS3(req.files['visaImage']);
            visa.visaImage = visaImage;
        }
        if (req.files['cardImage']) {
            const cardImage = await uploadFiletoS3(req.files['cardImage']);
            visa.cardImage = cardImage;
        }

        if (req.files['reviewImages']) {
            const reviewImages = await Promise.all(
                req.files['reviewImages'].map(async (file) => await uploadFiletoS3(file))
            );

            // Update review images
            visa.reviews = req.body.reviews.map((review, index) => ({
                ...review,
                image: reviewImages[index]
            }));
        }

        // Update other fields
        Object.assign(visa, req.body);

        const updatedVisa = await visa.save();
        res.status(200).json(updatedVisa);
})

const deleteVisa = catchAsyncError(async (req, req, next)=>{
    const visa = await Visa.findByIdAndDelete(req.params.id);
    if (!visa) return next(new ErrorHandling(400, "Visa not found"));
    res.status(200).json({ message: 'Visa deleted successfully' });
})

module.exports = {createVisa, getAllVisas, getAllVisasCard, getVisaById, updateVisa, deleteVisa};