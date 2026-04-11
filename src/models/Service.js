const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, enum: ['basic', 'standard', 'premium'] },
  price: Number,
  description: String,
  deliveryTime: String,
  revisions: Number,
  features: [String]
});

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 80 },
  slug: { type: String, unique: true, sparse: true },
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
  subcategory: String,
  
  pricingType: { 
    type: String, 
    enum: ['fixed', 'hourly', 'package'],
    required: true 
  },
  basePrice: { type: Number, required: true },
  
  packages: [packageSchema],
  
  deliveryTime: { type: String, required: true },
  revisionsIncluded: { type: Number, default: 0 },
  
  images: [{ type: String }],
  videoUrl: String,
  
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  requirementsFromBuyer: [String],
  
  serviceAreas: [{
    city: String,
    areas: [String]
  }],
  
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  tags: [String],
  
}, {
  timestamps: true
});

// Generate unique slug from title before save
serviceSchema.pre('save', async function() {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
