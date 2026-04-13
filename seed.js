const connectDB = require('./src/utils/db');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await connectDB();
    
    // Delete existing test user
    await User.deleteOne({email: 'test@example.com'});
    
    // Create test customer
    const testCustomer = await User.create({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com',
      password: '12345678', // will be hashed
      role: 'customer',
      phone: '1234567890',
      city: 'TestCity',
      area: 'TestArea'
    });
    
    // Create test provider
    const testProvider = await User.create({
      firstName: 'Test',
      lastName: 'Provider',
      email: 'provider@example.com',
      password: '12345678',
      role: 'provider',
      phone: '0987654321',
      city: 'ProviderCity',
      area: 'ProviderArea',
      skills: ['Plumbing', 'Electrical'],
      hourlyRate: 25
    });
    
    console.log('✅ Test users created:');
    console.log('- Customer: test@example.com / 12345678');
    console.log('- Provider: provider@example.com / 12345678');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();

