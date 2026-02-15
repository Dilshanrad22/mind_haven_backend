/**
 * End-to-End Integration Test
 * Tests Frontend -> Backend -> Database connection
 */

const BASE_URL = 'http://localhost:5000/api';

console.log('🔍 MIND HAVEN - FULL STACK INTEGRATION TEST\n');
console.log('='.repeat(70));

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Backend Server Health
async function testBackendHealth() {
  log('\n📡 TEST 1: Backend Server Health Check', 'cyan');
  log('-'.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (data.success && data.status === 'healthy') {
      log('✅ Backend Server: ONLINE', 'green');
      log(`   Uptime: ${Math.floor(data.uptime)} seconds`, 'blue');
      log(`   Timestamp: ${data.timestamp}`, 'blue');
      return true;
    }
  } catch (error) {
    log('❌ Backend Server: OFFLINE', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Database Connection via Backend
async function testDatabaseConnection() {
  log('\n💾 TEST 2: Database Connection Check', 'cyan');
  log('-'.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();
    
    if (data.success) {
      log('✅ Database Connection: ACTIVE', 'green');
      log(`   Message: ${data.message}`, 'blue');
      return true;
    }
  } catch (error) {
    log('❌ Database Connection: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: User Authentication Flow
async function testUserAuthentication() {
  log('\n🔐 TEST 3: User Authentication Flow', 'cyan');
  log('-'.repeat(70));
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  // Step 3a: Create new user
  log('\n  Step 3a: Creating new test user...', 'yellow');
  try {
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
        userType: 'user',
      }),
    });
    
    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      log('  ✅ User Created Successfully', 'green');
      log(`     Email: ${testEmail}`, 'blue');
      log(`     User ID: ${signupData.data.user._id}`, 'blue');
    } else {
      log(`  ❌ Signup Failed: ${signupData.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ Signup Error: ${error.message}`, 'red');
    return false;
  }
  
  // Step 3b: Login with created user
  log('\n  Step 3b: Testing login with created user...', 'yellow');
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      log('  ✅ Login Successful', 'green');
      log(`     Token Generated: ${loginData.data.token.substring(0, 30)}...`, 'blue');
      
      // Step 3c: Verify token works
      log('\n  Step 3c: Verifying JWT token...', 'yellow');
      const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
        },
      });
      
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        log('  ✅ Token Verification: SUCCESS', 'green');
        log(`     Retrieved Profile: ${profileData.data.name}`, 'blue');
        return true;
      }
    } else {
      log(`  ❌ Login Failed: ${loginData.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ Login Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Doctor Registration Flow
async function testDoctorFlow() {
  log('\n👨‍⚕️ TEST 4: Doctor Registration & Profile Creation', 'cyan');
  log('-'.repeat(70));
  
  const doctorEmail = `doctor_${Date.now()}@example.com`;
  const doctorPassword = 'DoctorPass123!';
  
  try {
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: doctorEmail,
        password: doctorPassword,
        name: 'Dr. Test Smith',
        userType: 'doctor',
      }),
    });
    
    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      log('✅ Doctor Account Created', 'green');
      log(`   Email: ${doctorEmail}`, 'blue');
      
      // Login to verify doctor profile
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: doctorEmail,
          password: doctorPassword,
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.data.user.doctorProfile) {
        log('✅ Doctor Profile Auto-Created', 'green');
        log(`   Specialization: ${loginData.data.user.doctorProfile.specialization}`, 'blue');
        return true;
      }
    }
  } catch (error) {
    log(`❌ Doctor Flow Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Get Doctors List
async function testGetDoctors() {
  log('\n📋 TEST 5: Fetch Doctors List', 'cyan');
  log('-'.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/doctors`);
    const data = await response.json();
    
    if (data.success) {
      log(`✅ Doctors Retrieved: ${data.data.total} doctor(s) found`, 'green');
      
      if (data.data.doctors.length > 0) {
        log(`   Sample Doctor: Dr. ${data.data.doctors[0].userId.name}`, 'blue');
        log(`   Specialization: ${data.data.doctors[0].specialization}`, 'blue');
      }
      return true;
    }
  } catch (error) {
    log(`❌ Get Doctors Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Frontend Connection Test
async function testFrontendConnection() {
  log('\n🌐 TEST 6: Frontend Server Check', 'cyan');
  log('-'.repeat(70));
  
  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      log('✅ Frontend Server: ONLINE', 'green');
      log(`   Status: ${response.status} ${response.statusText}`, 'blue');
      log('   URL: http://localhost:3000', 'blue');
      return true;
    }
  } catch (error) {
    log('❌ Frontend Server: OFFLINE', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    backendHealth: false,
    databaseConnection: false,
    userAuth: false,
    doctorFlow: false,
    getDoctors: false,
    frontendConnection: false,
  };
  
  results.backendHealth = await testBackendHealth();
  results.databaseConnection = await testDatabaseConnection();
  results.userAuth = await testUserAuthentication();
  results.doctorFlow = await testDoctorFlow();
  results.getDoctors = await testGetDoctors();
  results.frontendConnection = await testFrontendConnection();
  
  // Final Summary
  log('\n\n' + '='.repeat(70), 'cyan');
  log('📊 INTEGRATION TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const tests = [
    { name: 'Backend Server Health', status: results.backendHealth },
    { name: 'Database Connection', status: results.databaseConnection },
    { name: 'User Authentication Flow', status: results.userAuth },
    { name: 'Doctor Registration Flow', status: results.doctorFlow },
    { name: 'Get Doctors Endpoint', status: results.getDoctors },
    { name: 'Frontend Server', status: results.frontendConnection },
  ];
  
  log('\nTest Results:', 'yellow');
  tests.forEach((test, index) => {
    const icon = test.status ? '✅' : '❌';
    const color = test.status ? 'green' : 'red';
    log(`  ${icon} ${index + 1}. ${test.name}`, color);
  });
  
  const passedTests = tests.filter(t => t.status).length;
  const totalTests = tests.length;
  const percentage = Math.round((passedTests / totalTests) * 100);
  
  log('\n' + '='.repeat(70));
  log(`\n🎯 FINAL SCORE: ${passedTests}/${totalTests} Tests Passed (${percentage}%)`, 
    percentage === 100 ? 'green' : percentage >= 75 ? 'yellow' : 'red');
  
  if (percentage === 100) {
    log('\n🎉 CONGRATULATIONS! Your full stack is working perfectly!', 'green');
    log('   ✅ Frontend: Running', 'green');
    log('   ✅ Backend: Running', 'green');
    log('   ✅ Database: Connected', 'green');
    log('   ✅ Authentication: Working', 'green');
    log('   ✅ All Features: Operational', 'green');
  } else if (percentage >= 75) {
    log('\n⚠️  Most components are working, but some issues detected.', 'yellow');
  } else {
    log('\n❌ Critical issues detected. Please check the failed tests above.', 'red');
  }
  
  log('\n' + '='.repeat(70) + '\n');
}

// Execute all tests
runAllTests().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});
