require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./src/models/User');

const API_BASE = 'http://localhost:5000/api';

async function testAdminEndpoints() {
  try {
    console.log('🔍 Testing Admin Endpoints...\n');

    // Connect to database first to get admin credentials
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Step 1: Login as admin
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@mindhaven.lk',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      process.exit(1);
    }

    const token = loginResponse.data.data.token;
    console.log('✓ Admin login successful');
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Step 2: Test stats endpoint
    console.log('2️⃣ Testing GET /api/admin/stats...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/admin/stats`, { headers });
      console.log('✓ Stats endpoint working');
      console.log('Stats data:', JSON.stringify(statsResponse.data.data, null, 2));
      console.log();
    } catch (error) {
      console.log('❌ Stats endpoint failed:', error.response?.data || error.message);
      console.log();
    }

    // Step 3: Test users endpoint
    console.log('3️⃣ Testing GET /api/admin/users...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/admin/users?page=1&limit=5`, { headers });
      console.log('✓ Users endpoint working');
      console.log(`Found ${usersResponse.data.data.users.length} users`);
      console.log('Sample users:');
      usersResponse.data.data.users.slice(0, 3).forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Active: ${user.isActive}`);
      });
      console.log();
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data || error.message);
      console.log();
    }

    // Step 4: Test doctors endpoint
    console.log('4️⃣ Testing GET /api/admin/doctors...');
    try {
      const doctorsResponse = await axios.get(`${API_BASE}/admin/doctors?page=1&limit=5`, { headers });
      console.log('✓ Doctors endpoint working');
      console.log(`Found ${doctorsResponse.data.data.doctors.length} doctors`);
      console.log('Sample doctors:');
      doctorsResponse.data.data.doctors.slice(0, 3).forEach(doctor => {
        console.log(`  - ${doctor.userId?.name || 'Unknown'} - ${doctor.specialization} - Rating: ${doctor.rating}`);
      });
      console.log();
    } catch (error) {
      console.log('❌ Doctors endpoint failed:', error.response?.data || error.message);
      console.log();
    }

    // Step 5: Check database counts
    console.log('5️⃣ Checking Database Counts...');
    const userCount = await User.countDocuments({ userType: 'user' });
    const doctorCount = await User.countDocuments({ userType: 'doctor' });
    const adminCount = await User.countDocuments({ userType: 'admin' });
    console.log(`Database has:`);
    console.log(`  - ${userCount} users`);
    console.log(`  - ${doctorCount} doctors`);
    console.log(`  - ${adminCount} admins`);
    console.log();

    console.log('✅ All tests completed!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testAdminEndpoints();
