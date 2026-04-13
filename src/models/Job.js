const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proposedPrice: Number,
  coverLetter: String,
  estimatedDuration: String,
  appliedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { 
    type: String, 
    required: true,
    enum: [
      'plumbing', 'electrical', 'carpentry', 'painting',
      'cleaning', 'tutoring', 'it-support', 'gardening',
      'home-repair', 'appliance-repair', 'moving', 'other'
    ]
  },
  
  budgetType: { 
    type: String, 
    enum: ['fixed', 'hourly', 'negotiable'],
    required: true 
  },
  budgetAmount: { type: Number, required: true },
  
  location: {
    city: { type: String, required: true },
    area: { type: String, required: true },
    fullAddress: { type: String },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  images: [{ type: String }],
  videoUrl: { type: String },
  
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  applicants: [applicantSchema],
  
  hiredProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hiredAt: Date,
  
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'open'
  },
  
  deadline: Date,
  startedAt: Date,
  completedAt: Date,
  
  viewCount: { type: Number, default: 0 },
  
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
