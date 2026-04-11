const express = require('express');
const { uploadImage, uploadImages, uploadVideo } = require('../controllers/uploadController');
const { upload } = require('../config/cloudinary');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.post('/image', upload.single('image'), uploadImage);
router.post('/images', upload.array('images', 5), uploadImages);
router.post('/video', upload.single('video'), uploadVideo);

module.exports = router;
