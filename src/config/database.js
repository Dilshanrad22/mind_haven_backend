const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Error connecting to MongoDB (attempt ${i + 1}/${retries}): ${error.message}`);
      if (i < retries - 1) {
        const delay = Math.min(5000 * (i + 1), 15000);
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('❌ Failed to connect to MongoDB after all retries. Exiting...');
  process.exit(1);
};

module.exports = connectDB;
