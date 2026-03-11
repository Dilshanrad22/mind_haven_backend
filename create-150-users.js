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

// Sri Lankan names database
const maleFirstNames = [
  'Kasun', 'Tharindu', 'Ravindu', 'Dineth', 'Nipun', 'Chamod', 'Supun', 'Udara',
  'Dilshan', 'Chamara', 'Lahiru', 'Dhanushka', 'Shehan', 'Asanka', 'Nuwan',
  'Chanuka', 'Sahan', 'Sachitha', 'Malintha', 'Isuru', 'Chathura', 'Sandun',
  'Hasitha', 'Dasun', 'Malinda', 'Janith', 'Thilina', 'Kavinda', 'Prabath',
  'Amila', 'Buddhika', 'Roshan', 'Gayan', 'Sampath', 'Pradeep', 'Ruwan',
  'Sajith', 'Danushka', 'Harsha', 'Prasanna', 'Thisara', 'Kalana', 'Dilan',
  'Ashane', 'Dimuth', 'Pathum', 'Avishka', 'Bhanuka', 'Oshada', 'Wanindu'
];

const femaleFirstNames = [
  'Nimalka', 'Sanduni', 'Chamodi', 'Thilini', 'Amaya', 'Sachini', 'Dishani',
  'Oshadi', 'Nethmi', 'Piyumi', 'Madhavi', 'Aruna', 'Niluka', 'Tharanga',
  'Dilini', 'Saranga', 'Kushani', 'Nimasha', 'Piumika', 'Yashodha', 'Chathurika',
  'Shehani', 'Anusha', 'Priyanka', 'Chinthana', 'Hashini', 'Amandi', 'Samadhi',
  'Chalani', 'Yashasvi', 'Manari', 'Senuri', 'Hiruni', 'Shanika', 'Nadeeka',
  'Chamila', 'Dulani', 'Pavani', 'Gayani', 'Sandali', 'Tharushi', 'Methmi',
  'Ishara', 'Rashmi', 'Kaveesha', 'Dinusha', 'Tehani', 'Savindi', 'Imesha'
];

const lastNames = [
  'Perera', 'Fernando', 'Silva', 'Jayawardena', 'Wickramasinghe', 'Dissanayake',
  'Amarasinghe', 'Bandara', 'Gunasekara', 'Herath', 'Weerasinghe', 'Lakmal',
  'Mendis', 'Rathnayake', 'Manjula', 'Jayasinghe', 'Pathirana', 'Karunarathna',
  'Rajapaksha', 'Gunawardena', 'Wijesinghe', 'Samarasinghe', 'Kumara', 'Gamage',
  'Ranasinghe', 'Liyanage', 'Peiris', 'Kumarasinghe', 'Ekanayake', 'Seneviratne',
  'Dasanayake', 'Rodrigo', 'Alwis', 'Abeysekara', 'Munasinghe', 'Dharmasena',
  'Abeywardena', 'Jayasuriya', 'Ratnayake', 'Wickremasinghe'
];

const cities = [
  'Colombo 01', 'Colombo 03', 'Colombo 05', 'Colombo 07', 'Colombo 10',
  'Kandy', 'Galle', 'Negombo', 'Kurunegala', 'Matara', 'Jaffna', 'Anuradhapura',
  'Ratnapura', 'Batticaloa', 'Trincomalee', 'Badulla', 'Gampaha', 'Kalutara',
  'Hambantota', 'Chilaw', 'Nuwara Eliya', 'Ampara', 'Polonnaruwa', 'Kegalle',
  'Monaragala', 'Puttalam', 'Vavuniya', 'Kilinochchi', 'Mannar', 'Mullaitivu',
  'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Maharagama', 'Kotte', 'Battaramulla',
  'Piliyandala', 'Kaduwela', 'Kelaniya', 'Homagama', 'Nugegoda', 'Panadura',
  'Horana', 'Avissawella', 'Wattala', 'Ja-Ela'
];

// Generate random date of birth (ages 15-30)
const getRandomDOB = () => {
  const year = Math.floor(Math.random() * 16) + 1996; // 1996-2011 (ages 15-30)
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Safe day range
  return new Date(year, month, day);
};

// Generate random phone number
const getRandomPhone = () => {
  const prefix = ['077', '076', '075', '071', '070'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return randomPrefix + randomNumber;
};

// Generate 150 unique users
const generateUsers = () => {
  const users = [];
  const usedEmails = new Set();
  
  for (let i = 0; i < 150; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate unique email
    let email;
    let emailCounter = 1;
    do {
      const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailCounter > 1 ? emailCounter : ''}@gmail.com`;
      email = baseEmail;
      emailCounter++;
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    users.push({
      name: fullName,
      email: email,
      phone: getRandomPhone(),
      address: `${cities[Math.floor(Math.random() * cities.length)]}, Sri Lanka`,
      dateOfBirth: getRandomDOB(),
      gender: isMale ? 'male' : 'female'
    });
  }
  
  return users;
};

const create150Users = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Creating 150 Sri Lankan user accounts...\n');

    // Hash password (same for all: "password123")
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userData = generateUsers();
    const createdUsers = [];
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of userData) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          skippedCount++;
          createdUsers.push({ ...user, status: 'exists' });
        } else {
          // Create new user
          const newUser = await User.create({
            ...user,
            password: hashedPassword,
            userType: 'user'
          });
          
          successCount++;
          createdUsers.push({ ...user, status: 'created' });
          
          // Show progress every 10 users
          if (successCount % 10 === 0) {
            console.log(`✅ Created ${successCount} users...`);
          }
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ Failed: ${user.name} - ${error.message}`);
      }
    }

    // Generate README content
    const readmeContent = `# Mind Haven - 150 User Test Accounts

## Sri Lankan User Accounts

**Default Password for All Accounts:** \`password123\`

Total Users Generated: ${userData.length}
- ✅ Successfully Created: ${successCount}
- ⏭️  Already Existed: ${skippedCount}
- ❌ Failed: ${errorCount}

---

## User Login Credentials

| # | Name | Email | Password | Gender | Location |
|---|------|-------|----------|--------|----------|
${createdUsers.map((user, index) => {
  const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
  return `| ${index + 1} | ${user.name} | ${user.email} | password123 | ${user.gender} | ${user.address} |`;
}).join('\n')}

---

## Quick Copy - Email List Only

\`\`\`
${createdUsers.map(user => user.email).join('\n')}
\`\`\`

---

## Statistics

- **Total Accounts:** ${userData.length}
- **Male Users:** ${createdUsers.filter(u => u.gender === 'male').length}
- **Female Users:** ${createdUsers.filter(u => u.gender === 'female').length}
- **Age Range:** 15-30 years
- **Locations:** ${[...new Set(createdUsers.map(u => u.address))].length} different cities

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
    fs.writeFileSync('150_USERS_README.md', readmeContent);
    console.log('\n📄 Login details saved to: 150_USERS_README.md');

    console.log('\n✅ User creation complete!');
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Already existed: ${skippedCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log(`   Total users: ${userData.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
};

create150Users();
