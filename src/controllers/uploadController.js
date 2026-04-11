const { upload } = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    res.status(200).json({
      success: true,
      data: req.file.path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload images' });
    }

    const imageUrls = req.files.map(file => file.path);

    res.status(200).json({
      success: true,
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video' });
    }

    res.status(200).json({
      success: true,
      data: req.file.path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
