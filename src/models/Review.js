const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reviewee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true,
    unique: true
  },
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service'
  },
  
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  
  ratings: {
    communication: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 }
  },
  
  comment: { type: String, required: true, maxlength: 1000 },
  
  images: [String],
  
  response: {
    content: String,
    createdAt: Date
  },
  
  isVerified: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  
  helpfulCount: { type: Number, default: 0 },
  
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
