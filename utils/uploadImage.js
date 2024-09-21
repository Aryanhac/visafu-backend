const s3 = require('./AWS/S3');
const multer = require('multer');
const multerS3 = require('multer-s3');


const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;