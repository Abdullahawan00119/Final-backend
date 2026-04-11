const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  
  subcategories: [{
    name: String,
    slug: String,
    description: String
  }],
  
  jobCount: { type: Number, default: 0 },
  serviceCount: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
