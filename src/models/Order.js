const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  
  orderType: { type: String, enum: ['service', 'job'], required: true },
  packageType: { type: String, enum: ['basic', 'standard', 'premium'] },
  
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  customerRequirements: String,
  attachments: [String],
  
  deliveryDate: Date,
  
  status: { 
    type: String, 
    enum: [
      'pending', 'accepted', 'in-progress', 
      'delivered', 'revision-requested', 'completed', 
      'cancelled', 'disputed'
    ],
    default: 'pending'
  },
  
  milestones: [{
    title: String,
    status: { type: String, enum: ['pending', 'completed'] },
    completedAt: Date
  }],
  
  deliveryNote: String,
  deliveryFiles: [String],
  deliveredAt: Date,
  
  revisionsUsed: { type: Number, default: 0 },
  revisionsAllowed: { type: Number, default: 0 },
  
  completedAt: Date,
  autoCompleteAt: Date,
  
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  
}, {
  timestamps: true
});

// Auto-generate order number before saving
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${count + 1}`;
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
