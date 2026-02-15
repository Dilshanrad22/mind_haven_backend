require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Drop and recreate User collection indexes
    console.log('Fixing User collection indexes...');
    const usersCollection = db.collection('users');
    try {
      await usersCollection.dropIndexes();
      console.log('✅ Dropped all User indexes');
      
      // Recreate the necessary indexes
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ userType: 1 });
      console.log('✅ Recreated User indexes\n');
    } catch (error) {
      console.log('User collection might not exist yet or no indexes to drop\n');
    }

    // Drop and recreate Doctor collection indexes
    console.log('Fixing Doctor collection indexes...');
    const doctorsCollection = db.collection('doctors');
    try {
      await doctorsCollection.dropIndexes();
      console.log('✅ Dropped all Doctor indexes');
      
      // Recreate the necessary indexes
      await doctorsCollection.createIndex({ userId: 1 }, { unique: true });
      await doctorsCollection.createIndex({ licenseNumber: 1 }, { unique: true });
      await doctorsCollection.createIndex({ specialization: 1 });
      await doctorsCollection.createIndex({ rating: -1 });
      await doctorsCollection.createIndex({ isVerified: 1 });
      console.log('✅ Recreated Doctor indexes\n');
    } catch (error) {
      console.log('Doctor collection might not exist yet or no indexes to drop\n');
    }

    console.log('✅ Database indexes fixed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
    process.exit(1);
  }
}

fixIndexes();
