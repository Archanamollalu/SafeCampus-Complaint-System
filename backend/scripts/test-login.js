const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../src/models/User');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const testLogin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // Test admin login
    const testEmail = 'admin@example.com';
    const testPassword = 'password';

    console.log('\n🔍 Testing login for:', testEmail);
    const user = await User.findOne({ email: testEmail }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      storedPasswordHash: user.password.substring(0, 20) + '...'
    });

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isValid = await user.comparePassword(testPassword);
    console.log('Password valid:', isValid);

    if (!isValid) {
      // Try to hash the password and compare manually
      console.log('\n⚠️ Password comparison failed. Testing alternative hashing...');
      const manualHash = await bcrypt.hash(testPassword, 12);
      const manualCompare = await bcrypt.compare(testPassword, user.password);
      console.log('Manual bcrypt comparison:', manualCompare);
    }

    await mongoose.connection.close();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
