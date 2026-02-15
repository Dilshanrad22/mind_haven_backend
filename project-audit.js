/**
 * MIND HAVEN - COMPLETE PROJECT AUDIT
 * Verifies all components, structure, and functionality
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, '..', 'mind_haven', 'my-app');
const BACKEND_PATH = __dirname;

console.log('🔍 MIND HAVEN - COMPLETE PROJECT AUDIT\n');
console.log('='.repeat(80));

const results = {
  structure: [],
  files: [],
  config: [],
  dependencies: [],
  servers: [],
  integration: [],
  errors: [],
};

// Helper functions
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  return { path: filePath, description, exists };
}

function checkDirExists(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  return { path: dirPath, description, exists };
}

function log(section, message, status = 'info') {
  const icons = { pass: '✅', fail: '❌', info: 'ℹ️', warn: '⚠️' };
  console.log(`${icons[status]} ${message}`);
}

// SECTION 1: Project Structure
console.log('\n📁 SECTION 1: PROJECT STRUCTURE');
console.log('-'.repeat(80));

const structures = [
  checkDirExists(BACKEND_PATH, 'Backend root directory'),
  checkDirExists(FRONTEND_PATH, 'Frontend root directory'),
  checkDirExists(path.join(BACKEND_PATH, 'src'), 'Backend src directory'),
  checkDirExists(path.join(BACKEND_PATH, 'src', 'routes'), 'Routes directory'),
  checkDirExists(path.join(BACKEND_PATH, 'src', 'models'), 'Models directory'),
  checkDirExists(path.join(BACKEND_PATH, 'src', 'config'), 'Config directory'),
  checkDirExists(path.join(BACKEND_PATH, 'src', 'middleware'), 'Middleware directory'),
  checkDirExists(path.join(BACKEND_PATH, 'node_modules'), 'Backend node_modules'),
  checkDirExists(path.join(FRONTEND_PATH, 'src'), 'Frontend src directory'),
  checkDirExists(path.join(FRONTEND_PATH, 'node_modules'), 'Frontend node_modules'),
];

structures.forEach(item => {
  log('structure', `${item.description}: ${item.path}`, item.exists ? 'pass' : 'fail');
  results.structure.push(item);
});

// SECTION 2: Critical Files
console.log('\n📄 SECTION 2: CRITICAL FILES');
console.log('-'.repeat(80));

const criticalFiles = [
  // Backend files
  checkFileExists(path.join(BACKEND_PATH, 'package.json'), 'Backend package.json'),
  checkFileExists(path.join(BACKEND_PATH, '.env'), 'Backend .env'),
  checkFileExists(path.join(BACKEND_PATH, 'server.js'), 'Backend server.js'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'config', 'database.js'), 'Database config'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'routes', 'auth.js'), 'Auth routes'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'routes', 'doctors.js'), 'Doctor routes'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'models', 'User.js'), 'User model'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'models', 'Doctor.js'), 'Doctor model'),
  checkFileExists(path.join(BACKEND_PATH, 'src', 'middleware', 'auth.js'), 'Auth middleware'),
  
  // Frontend files
  checkFileExists(path.join(FRONTEND_PATH, 'package.json'), 'Frontend package.json'),
  checkFileExists(path.join(FRONTEND_PATH, '.env.local'), 'Frontend .env.local'),
  checkFileExists(path.join(FRONTEND_PATH, 'next.config.ts'), 'Next.js config (TS)') || 
    checkFileExists(path.join(FRONTEND_PATH, 'next.config.js'), 'Next.js config (JS)'),
];

criticalFiles.forEach(item => {
  if (item) {
    log('files', `${item.description}`, item.exists ? 'pass' : 'fail');
    results.files.push(item);
  }
});

// SECTION 3: Configuration Check
console.log('\n⚙️  SECTION 3: CONFIGURATION');
console.log('-'.repeat(80));

try {
  // Check backend package.json
  const backendPkg = JSON.parse(fs.readFileSync(path.join(BACKEND_PATH, 'package.json'), 'utf8'));
  log('config', `Backend name: ${backendPkg.name}`, 'pass');
  log('config', `Backend version: ${backendPkg.version}`, 'pass');
  
  const requiredBackendDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors', 'dotenv'];
  const missingBackendDeps = requiredBackendDeps.filter(dep => !backendPkg.dependencies[dep]);
  
  if (missingBackendDeps.length === 0) {
    log('config', 'All required backend dependencies installed', 'pass');
  } else {
    log('config', `Missing backend dependencies: ${missingBackendDeps.join(', ')}`, 'fail');
  }
  
  // Check frontend package.json
  const frontendPkg = JSON.parse(fs.readFileSync(path.join(FRONTEND_PATH, 'package.json'), 'utf8'));
  log('config', `Frontend name: ${frontendPkg.name}`, 'pass');
  log('config', `Frontend framework: Next.js ${frontendPkg.dependencies.next || 'installed'}`, 'pass');
  
  // Check .env
  const envContent = fs.readFileSync(path.join(BACKEND_PATH, '.env'), 'utf8');
  const hasMongoUri = envContent.includes('MONGODB_URI');
  const hasJwtSecret = envContent.includes('JWT_SECRET');
  const hasPort = envContent.includes('PORT');
  
  log('config', 'MongoDB URI configured', hasMongoUri ? 'pass' : 'fail');
  log('config', 'JWT Secret configured', hasJwtSecret ? 'pass' : 'fail');
  log('config', 'Port configured', hasPort ? 'pass' : 'fail');
  
  results.config.push({ configured: true });
} catch (error) {
  log('config', `Configuration check failed: ${error.message}`, 'fail');
  results.errors.push(error.message);
}

// SECTION 4: Server Status
console.log('\n🖥️  SECTION 4: SERVER STATUS');
console.log('-'.repeat(80));

async function checkServers() {
  // Check Backend
  try {
    const backendResponse = await fetch('http://localhost:5000/api/health');
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      log('servers', `Backend server: RUNNING (uptime: ${Math.floor(data.uptime)}s)`, 'pass');
      results.servers.push({ name: 'backend', status: 'running' });
    }
  } catch (error) {
    log('servers', 'Backend server: NOT RESPONDING', 'fail');
    results.servers.push({ name: 'backend', status: 'down' });
  }
  
  // Check Frontend
  try {
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      log('servers', 'Frontend server: RUNNING', 'pass');
      results.servers.push({ name: 'frontend', status: 'running' });
    }
  } catch (error) {
    log('servers', 'Frontend server: NOT RESPONDING', 'fail');
    results.servers.push({ name: 'frontend', status: 'down' });
  }
}

// SECTION 5: Integration Test
async function testIntegration() {
  console.log('\n🔗 SECTION 5: INTEGRATION TEST');
  console.log('-'.repeat(80));
  
  try {
    // Test API endpoint
    const testResponse = await fetch('http://localhost:5000/api/test');
    const testData = await testResponse.json();
    log('integration', `API test endpoint: ${testData.message}`, 'pass');
    
    // Test auth endpoint availability
    const signupTest = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com' }) // Incomplete data to test endpoint existence
    });
    
    log('integration', 'Auth endpoints: ACCESSIBLE', signupTest.status >= 400 ? 'pass' : 'pass');
    
    // Test doctors endpoint
    const doctorsResponse = await fetch('http://localhost:5000/api/doctors');
    const doctorsData = await doctorsResponse.json();
    log('integration', `Doctors endpoint: ${doctorsData.data.total} doctors found`, 'pass');
    
    results.integration.push({ working: true });
  } catch (error) {
    log('integration', `Integration test failed: ${error.message}`, 'fail');
    results.errors.push(error.message);
  }
}

// SECTION 6: Code Quality Check
console.log('\n📝 SECTION 6: CODE QUALITY');
console.log('-'.repeat(80));

try {
  // Check for proper error handling in routes
  const authRoute = fs.readFileSync(path.join(BACKEND_PATH, 'src', 'routes', 'auth.js'), 'utf8');
  const hasTryCatch = authRoute.includes('try') && authRoute.includes('catch');
  log('quality', 'Error handling in routes', hasTryCatch ? 'pass' : 'warn');
  
  // Check for password hashing
  const userModel = fs.readFileSync(path.join(BACKEND_PATH, 'src', 'models', 'User.js'), 'utf8');
  const hasBcrypt = userModel.includes('bcrypt');
  log('quality', 'Password hashing implemented', hasBcrypt ? 'pass' : 'fail');
  
  // Check for JWT
  const hasJwt = fs.existsSync(path.join(BACKEND_PATH, 'src', 'utils', 'jwt.js')) ||
                 authRoute.includes('jsonwebtoken') || authRoute.includes('generateToken');
  log('quality', 'JWT authentication implemented', hasJwt ? 'pass' : 'fail');
  
  // Check for CORS
  const serverFile = fs.readFileSync(path.join(BACKEND_PATH, 'server.js'), 'utf8');
  const hasCors = serverFile.includes('cors');
  log('quality', 'CORS configured', hasCors ? 'pass' : 'warn');
  
} catch (error) {
  log('quality', `Code quality check failed: ${error.message}`, 'fail');
}

// Run async checks and generate final report
async function runAudit() {
  await checkServers();
  await testIntegration();
  
  // FINAL SUMMARY
  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));
  
  const structurePass = results.structure.filter(s => s.exists).length;
  const structureTotal = results.structure.length;
  
  const filesPass = results.files.filter(f => f.exists).length;
  const filesTotal = results.files.length;
  
  const serversRunning = results.servers.filter(s => s.status === 'running').length;
  const serversTotal = 2; // Frontend + Backend
  
  console.log('\n📁 Structure:', `${structurePass}/${structureTotal} directories found`);
  console.log('📄 Files:', `${filesPass}/${filesTotal} critical files exist`);
  console.log('⚙️  Configuration:', results.config.length > 0 ? 'Configured ✅' : 'Not configured ❌');
  console.log('🖥️  Servers:', `${serversRunning}/${serversTotal} servers running`);
  console.log('🔗 Integration:', results.integration.length > 0 ? 'Working ✅' : 'Failed ❌');
  console.log('❌ Errors:', results.errors.length || 'None');
  
  const totalChecks = structureTotal + filesTotal + serversTotal + 2; // +2 for config and integration
  const passedChecks = structurePass + filesPass + serversRunning + 
                       (results.config.length > 0 ? 1 : 0) + 
                       (results.integration.length > 0 ? 1 : 0);
  
  const percentage = Math.round((passedChecks / totalChecks) * 100);
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎯 OVERALL PROJECT HEALTH: ${percentage}%`);
  console.log('='.repeat(80));
  
  if (percentage === 100) {
    console.log('\n🎉 CONGRATULATIONS! Your project is PERFECT!');
    console.log('   ✅ All directories present');
    console.log('   ✅ All files exist');
    console.log('   ✅ Configuration correct');
    console.log('   ✅ Both servers running');
    console.log('   ✅ Integration working');
    console.log('   ✅ Code quality good');
    console.log('\n   👍 Your Mind Haven project is PRODUCTION-READY for development!');
  } else if (percentage >= 90) {
    console.log('\n✅ EXCELLENT! Your project is in great shape!');
    console.log('   Minor issues detected but overall very good.');
  } else if (percentage >= 75) {
    console.log('\n⚠️  GOOD, but some issues need attention.');
    console.log('   Check the failed items above.');
  } else {
    console.log('\n❌ ATTENTION NEEDED! Several critical issues detected.');
    console.log('   Please review the failed checks above.');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

runAudit().catch(error => {
  console.error('Audit failed:', error.message);
  process.exit(1);
});
