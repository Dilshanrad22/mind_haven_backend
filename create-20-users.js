require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

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

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  userType: { type: String, enum: ['user', 'doctor'], default: 'user' },
  phone: String,
  address: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// Sri Lankan user data
const sriLankanUsers = [
  {
    name: 'Dulanjana Perera',
    email: 'dulanjana.perera@gmail.com',
    phone: '0771234567',
    address: 'Colombo 07, Sri Lanka',
    dateOfBirth: new Date(2006, 3, 15), // Age 19
    gender: 'male'
  },
  {
    name: 'Nimalka Fernando',
    email: 'nimalka.fernando@gmail.com',
    phone: '0772345678',
    address: 'Kandy, Sri Lanka',
    dateOfBirth: new Date(2008, 7, 22), // Age 17
    gender: 'female'
  },
  {
    name: 'Kasun Wickramasinghe',
    email: 'kasun.wickrama@gmail.com',
    phone: '0773456789',
    address: 'Galle, Sri Lanka',
    dateOfBirth: new Date(1996, 11, 5), // Age 29
    gender: 'male'
  },
  {
    name: 'Sanduni Rajapaksha',
    email: 'sanduni.raja@gmail.com',
    phone: '0774567890',
    address: 'Negombo, Sri Lanka',
    dateOfBirth: new Date(2001, 2, 18), // Age 24
    gender: 'female'
  },
  {
    name: 'Tharindu Silva',
    email: 'tharindu.silva@gmail.com',
    phone: '0775678901',
    address: 'Kurunegala, Sri Lanka',
    dateOfBirth: new Date(2004, 9, 30), // Age 21
    gender: 'male'
  },
  {
    name: 'Chamodi Dissanayake',
    email: 'chamodi.dissanayake@gmail.com',
    phone: '0776789012',
    address: 'Matara, Sri Lanka',
    dateOfBirth: new Date(2009, 1, 12), // Age 16
    gender: 'female'
  },
  {
    name: 'Ravindu Jayawardena',
    email: 'ravindu.jaya@gmail.com',
    phone: '0777890123',
    address: 'Jaffna, Sri Lanka',
    dateOfBirth: new Date(1999, 6, 8), // Age 26
    gender: 'male'
  },
  {
    name: 'Thilini Amarasinghe',
    email: 'thilini.amara@gmail.com',
    phone: '0778901234',
    address: 'Anuradhapura, Sri Lanka',
    dateOfBirth: new Date(2003, 4, 25), // Age 22
    gender: 'female'
  },
  {
    name: 'Kavinda Bandara',
    email: 'kavinda.bandara@gmail.com',
    phone: '0779012345',
    address: 'Ratnapura, Sri Lanka',
    dateOfBirth: new Date(2010, 10, 3), // Age 15
    gender: 'male'
  },
  {
    name: 'Amaya Gunasekara',
    email: 'amaya.guna@gmail.com',
    phone: '0760123456',
    address: 'Batticaloa, Sri Lanka',
    dateOfBirth: new Date(2000, 8, 14), // Age 25
    gender: 'female'
  },
  {
    name: 'Dineth Herath',
    email: 'dineth.herath@gmail.com',
    phone: '0761234567',
    address: 'Colombo 05, Sri Lanka',
    dateOfBirth: new Date(2005, 0, 20), // Age 20
    gender: 'male'
  },
  {
    name: 'Sachini Weerasinghe',
    email: 'sachini.weera@gmail.com',
    phone: '0762345678',
    address: 'Trincomalee, Sri Lanka',
    dateOfBirth: new Date(1998, 5, 11), // Age 27
    gender: 'female'
  },
  {
    name: 'Nipun Lakmal',
    email: 'nipun.lakmal@gmail.com',
    phone: '0763456789',
    address: 'Badulla, Sri Lanka',
    dateOfBirth: new Date(2002, 3, 7), // Age 23
    gender: 'male'
  },
  {
    name: 'Dishani Mendis',
    email: 'dishani.mendis@gmail.com',
    phone: '0764567890',
    address: 'Gampaha, Sri Lanka',
    dateOfBirth: new Date(2007, 11, 28), // Age 18
    gender: 'female'
  },
  {
    name: 'Chamod Rathnayake',
    email: 'chamod.rathna@gmail.com',
    phone: '0765678901',
    address: 'Kalutara, Sri Lanka',
    dateOfBirth: new Date(1997, 2, 16), // Age 28
    gender: 'male'
  },
  {
    name: 'Oshadi Silva',
    email: 'oshadi.silva@gmail.com',
    phone: '0766789012',
    address: 'Hambantota, Sri Lanka',
    dateOfBirth: new Date(2004, 7, 9), // Age 21
    gender: 'female'
  },
  {
    name: 'Supun Manjula',
    email: 'supun.manjula@gmail.com',
    phone: '0767890123',
    address: 'Chilaw, Sri Lanka',
    dateOfBirth: new Date(2001, 10, 24), // Age 24
    gender: 'male'
  },
  {
    name: 'Nethmi Jayasinghe',
    email: 'nethmi.jaya@gmail.com',
    phone: '0768901234',
    address: 'Nuwara Eliya, Sri Lanka',
    dateOfBirth: new Date(2006, 6, 19), // Age 19
    gender: 'female'
  },
  {
    name: 'Udara Pathirana',
    email: 'udara.pathirana@gmail.com',
    phone: '0769012345',
    address: 'Ampara, Sri Lanka',
    dateOfBirth: new Date(1999, 4, 2), // Age 26
    gender: 'male'
  },
  {
    name: 'Piyumi Karunarathna',
    email: 'piyumi.karuna@gmail.com',
    phone: '0750123456',
    address: 'Polonnaruwa, Sri Lanka',
    dateOfBirth: new Date(2003, 9, 13), // Age 22
    gender: 'female'
  }
];

const create20Users = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Creating 20 Sri Lankan user accounts...\n');

    // Hash password (same for all: "password123")
    const hashedPassword = await bcrypt.hash('password123', 10);

    const createdUsers = [];
    let successCount = 0;
    let skippedCount = 0;

    for (const userData of sriLankanUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⏭️  Skipped (already exists): ${userData.name} - ${userData.email}`);
          skippedCount++;
          createdUsers.push({ ...userData, status: 'exists' });
        } else {
          // Create new user
          const newUser = await User.create({
            ...userData,
            password: hashedPassword,
            userType: 'user'
          });
          
          console.log(`✅ Created: ${userData.name} - ${userData.email}`);
          successCount++;
          createdUsers.push({ ...userData, status: 'created' });
        }
      } catch (error) {
        console.log(`❌ Failed: ${userData.name} - ${error.message}`);
      }
    }

    // Generate README content
    const readmeContent = `# Mind Haven - Test User Accounts

## Sri Lankan User Accounts (Ages 15-30)

**Default Password for All Accounts:** \`password123\`

Total Users: ${sriLankanUsers.length}
- ✅ Successfully Created: ${successCount}
- ⏭️  Already Existed: ${skippedCount}

---

## User Login Credentials

| # | Name | Email | Password | Age | Gender | Location |
|---|------|-------|----------|-----|--------|----------|
${sriLankanUsers.map((user, index) => {
  const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
  return `| ${index + 1} | ${user.name} | ${user.email} | password123 | ${age} | ${user.gender} | ${user.address} |`;
}).join('\n')}

---

## Quick Copy Login Credentials

### Format: email / password

\`\`\`
${sriLankanUsers.map(user => `${user.email} / password123`).join('\n')}
\`\`\`

---

## Account Details

${sriLankanUsers.map((user, index) => {
  const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
  return `### ${index + 1}. ${user.name}
- **Email:** ${user.email}
- **Password:** password123
- **Age:** ${age} years
- **Gender:** ${user.gender}
- **Phone:** ${user.phone}
- **Address:** ${user.address}
- **Date of Birth:** ${user.dateOfBirth.toLocaleDateString()}
`;
}).join('\n')}

---

## Additional Test Accounts

### Counsellor Account
- **Email:** doctor@test.com
- **Password:** password123
- **Type:** Doctor/Counsellor

### Regular User Account
- **Email:** user@test.com
- **Password:** password123
- **Type:** Regular User

---

## Usage Instructions

1. Go to: http://localhost:3000/pages/login
2. Enter any email from the list above
3. Enter password: \`password123\`
4. Click "Sign In"

---

**Generated on:** ${new Date().toLocaleString()}
**Database:** Mind Haven MongoDB Atlas
`;

    // Write to README file
    fs.writeFileSync('TEST_USERS_README.md', readmeContent);
    console.log('\n📄 Login details saved to: TEST_USERS_README.md');

    console.log('\n✅ User creation complete!');
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Already existed: ${skippedCount}`);
    console.log(`   Total users: ${sriLankanUsers.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
};

create20Users();
