const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'john.doe@example.com',
  password: 'password123',
  name: 'John Doe',
  userType: 'user',
  phone: '+1234567890',
  address: '123 Main St, New York, NY',
  dateOfBirth: '1990-05-15',
  gender: 'male'
};

const testDoctor = {
  email: 'dr.smith@example.com',
  password: 'doctor123',
  name: 'Dr. Sarah Smith',
  userType: 'doctor',
  phone: '+1987654321',
  address: '456 Medical Center, Los Angeles, CA',
  dateOfBirth: '1985-08-20',
  gender: 'female'
};

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test functions
async function testSignup(userData, label) {
  console.log(`\n📝 Testing Signup: ${label}`);
  console.log('Request Data:', JSON.stringify(userData, null, 2));
  
  const result = await makeRequest('/auth/signup', 'POST', userData);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 201 && result.data.success) {
    console.log('✅ Signup Successful!');
    return result.data.data.token;
  } else {
    console.log('❌ Signup Failed!');
    return null;
  }
}

async function testLogin(email, password, label) {
  console.log(`\n🔑 Testing Login: ${label}`);
  console.log('Email:', email);
  
  const result = await makeRequest('/auth/login', 'POST', { email, password });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Login Successful!');
    return result.data.data.token;
  } else {
    console.log('❌ Login Failed!');
    return null;
  }
}

async function testGetProfile(token, label) {
  console.log(`\n👤 Testing Get Profile: ${label}`);
  
  const result = await makeRequest('/auth/me', 'GET', null, token);
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Get Profile Successful!');
    return true;
  } else {
    console.log('❌ Get Profile Failed!');
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Backend Authentication Tests...\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Regular User Signup
    console.log('\n\n📋 TEST 1: Regular User Signup');
    console.log('-'.repeat(60));
    const userToken = await testSignup(testUser, 'Regular User');
    
    // Test 2: Doctor Signup
    console.log('\n\n📋 TEST 2: Doctor Signup');
    console.log('-'.repeat(60));
    const doctorToken = await testSignup(testDoctor, 'Doctor');
    
    // Test 3: User Login
    console.log('\n\n📋 TEST 3: Regular User Login');
    console.log('-'.repeat(60));
    const userLoginToken = await testLogin(testUser.email, testUser.password, 'Regular User');
    
    // Test 4: Doctor Login
    console.log('\n\n📋 TEST 4: Doctor Login');
    console.log('-'.repeat(60));
    const doctorLoginToken = await testLogin(testDoctor.email, testDoctor.password, 'Doctor');
    
    // Test 5: Get User Profile
    if (userLoginToken) {
      console.log('\n\n📋 TEST 5: Get User Profile');
      console.log('-'.repeat(60));
      await testGetProfile(userLoginToken, 'Regular User');
    }
    
    // Test 6: Get Doctor Profile
    if (doctorLoginToken) {
      console.log('\n\n📋 TEST 6: Get Doctor Profile');
      console.log('-'.repeat(60));
      await testGetProfile(doctorLoginToken, 'Doctor');
    }
    
    // Test 7: Duplicate Email Signup (Should Fail)
    console.log('\n\n📋 TEST 7: Duplicate Email Signup (Should Fail)');
    console.log('-'.repeat(60));
    await testSignup(testUser, 'Duplicate User');
    
    // Test 8: Invalid Login (Should Fail)
    console.log('\n\n📋 TEST 8: Invalid Login (Should Fail)');
    console.log('-'.repeat(60));
    await testLogin(testUser.email, 'wrongpassword', 'Invalid Password');
    
    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ All Tests Completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Run all tests
runTests();
