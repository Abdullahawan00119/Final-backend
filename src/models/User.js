const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 8 },
  role: { 
    type: String, 
    enum: ['customer', 'provider', 'admin'], 
    required: true 
  },
  phone: { type: String, required: true },
  avatar: { type: String, default: null },
  bio: { type: String, maxlength: 500 },
  
  location: {
    city: { type: String, required: true },
    area: { type: String },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Provider-specific fields
  skills: [{ type: String }],
  hourlyRate: { type: Number },
  yearsOfExperience: { type: Number },
  certifications: [String],
  portfolio: [{ 
    title: String, 
    description: String, 
    imageUrl: String 
  }],
  
  // Ratings
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  
  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
