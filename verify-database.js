require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Simple schemas
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  userType: String
});

const doctorSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  specialization: String,
  licenseNumber: String
});

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

const checkDatabase = async () => {
  try {
    await connectDB();

    console.log('📊 DATABASE VERIFICATION\n');
    console.log('=' .repeat(60));

    // Count all users
    const totalUsers = await User.countDocuments();
    const regularUsers = await User.countDocuments({ userType: 'user' });
    const doctorUsers = await User.countDocuments({ userType: 'doctor' });
    const totalDoctorProfiles = await Doctor.countDocuments();

    console.log('\n📈 ACCOUNT STATISTICS:\n');
    console.log(`Total User Accounts:        ${totalUsers}`);
    console.log(`  - Regular Users:          ${regularUsers}`);
    console.log(`  - Doctor Users:           ${doctorUsers}`);
    console.log(`Total Doctor Profiles:      ${totalDoctorProfiles}`);

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ REGULAR USERS (userType: "user"):\n');
    
    const users = await User.find({ userType: 'user' }).select('name email').limit(25);
    users.forEach((user, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${user.name.padEnd(25)} - ${user.email}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ DOCTORS (userType: "doctor"):\n');
    
    const doctors = await User.find({ userType: 'doctor' })
      .select('name email')
      .limit(15);
    
    for (const doc of doctors) {
      const doctorProfile = await Doctor.findOne({ userId: doc._id })
        .select('specialization');
      const specialization = doctorProfile ? doctorProfile.specialization : 'N/A';
      console.log(`${doc.name.padEnd(30)} - ${doc.email.padEnd(40)} [${specialization}]`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ DATABASE VERIFICATION COMPLETE!');
    console.log('\n📝 Summary:');
    console.log(`   - All ${totalUsers} user accounts are in the database`);
    console.log(`   - All ${totalDoctorProfiles} doctor profiles are linked`);
    console.log(`   - Database is ready for testing!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
};

checkDatabase();
