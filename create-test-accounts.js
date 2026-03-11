require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Simple User schema (matching your models)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  userType: { type: String, enum: ['user', 'doctor'], default: 'user' },
  phone: String,
  isActive: { type: Boolean, default: true }
});

// Simple Doctor schema
const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  licenseNumber: { type: String, unique: true },
  qualification: [String],
  experience: Number,
  consultationFee: Number,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

const createTestAccounts = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Creating test accounts...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create regular user account
    let user = await User.findOne({ email: 'user@test.com' });
    if (user) {
      console.log('👤 Regular user already exists: user@test.com');
    } else {
      user = await User.create({
        email: 'user@test.com',
        password: hashedPassword,
        name: 'Test User',
        userType: 'user',
        phone: '1234567890'
      });
      console.log('✅ Created regular user: user@test.com / password123');
    }

    // 2. Create doctor user account
    let doctor = await User.findOne({ email: 'doctor@test.com' });
    if (doctor) {
      console.log('👨‍⚕️ Doctor user already exists: doctor@test.com');
    } else {
      doctor = await User.create({
        email: 'doctor@test.com',
        password: hashedPassword,
        name: 'Dr. Test Counsellor',
        userType: 'doctor',
        phone: '0987654321'
      });
      console.log('✅ Created doctor user: doctor@test.com / password123');

      // Create doctor profile
      const doctorProfile = await Doctor.create({
        userId: doctor._id,
        specialization: 'Clinical Psychology',
        licenseNumber: 'TEST-LIC-12345',
        qualification: ['Ph.D. in Clinical Psychology', 'Licensed Therapist'],
        experience: 5,
        consultationFee: 50,
        rating: 4.8,
        totalReviews: 42,
        isVerified: true
      });
      console.log('✅ Created doctor profile for test counsellor');
    }

    console.log('\n✅ Test accounts ready!');
    console.log('\n📋 Login credentials:');
    console.log('   Regular User: user@test.com / password123');
    console.log('   Counsellor: doctor@test.com / password123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
    process.exit(1);
  }
};

createTestAccounts();
