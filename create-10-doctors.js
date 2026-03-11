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

// Doctor schema
const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  licenseNumber: { type: String, unique: true },
  qualification: [String],
  experience: Number,
  consultationFee: Number,
  bio: String,
  services: [String],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

// Sri Lankan doctor data
const sriLankanDoctors = [
  {
    name: 'Dr. Pradeep Jayasuriya',
    email: 'dr.pradeep.jaya@mindhaven.lk',
    phone: '0112234567',
    address: 'Colombo 03, Sri Lanka',
    dateOfBirth: new Date(1985, 5, 12),
    gender: 'male',
    specialization: 'Clinical Psychology',
    licenseNumber: 'SL-PSY-2010-001',
    qualification: ['Ph.D. in Clinical Psychology', 'M.Sc. Counseling Psychology', 'B.Sc. Psychology'],
    experience: 14,
    consultationFee: 5000,
    bio: 'Specialized in anxiety, depression, and trauma therapy with over 14 years of experience.',
    services: ['Individual Therapy', 'Cognitive Behavioral Therapy', 'Trauma Counseling'],
    rating: 4.8,
    totalReviews: 156
  },
  {
    name: 'Dr. Samanthi Wijesinghe',
    email: 'dr.samanthi.wije@mindhaven.lk',
    phone: '0112345678',
    address: 'Kandy, Sri Lanka',
    dateOfBirth: new Date(1988, 2, 25),
    gender: 'female',
    specialization: 'Child Psychology',
    licenseNumber: 'SL-PSY-2014-002',
    qualification: ['Ph.D. Child Psychology', 'M.Sc. Developmental Psychology', 'B.A. Psychology'],
    experience: 10,
    consultationFee: 4500,
    bio: 'Expert in child behavioral issues, ADHD, and adolescent mental health.',
    services: ['Child Counseling', 'Family Therapy', 'Behavioral Therapy'],
    rating: 4.9,
    totalReviews: 203
  },
  {
    name: 'Dr. Ruwan Perera',
    email: 'dr.ruwan.perera@mindhaven.lk',
    phone: '0112456789',
    address: 'Galle, Sri Lanka',
    dateOfBirth: new Date(1982, 9, 18),
    gender: 'male',
    specialization: 'Psychiatry',
    licenseNumber: 'SL-PSY-2008-003',
    qualification: ['MBBS', 'MD Psychiatry', 'Diploma in Psychiatry'],
    experience: 16,
    consultationFee: 6000,
    bio: 'Consultant psychiatrist specializing in mood disorders and psychopharmacology.',
    services: ['Psychiatric Consultation', 'Medication Management', 'Depression Treatment'],
    rating: 4.7,
    totalReviews: 189
  },
  {
    name: 'Dr. Madhavi Fernando',
    email: 'dr.madhavi.fernando@mindhaven.lk',
    phone: '0112567890',
    address: 'Negombo, Sri Lanka',
    dateOfBirth: new Date(1990, 7, 8),
    gender: 'female',
    specialization: 'Relationship Counseling',
    licenseNumber: 'SL-PSY-2016-004',
    qualification: ['M.Phil. Marriage & Family Therapy', 'M.Sc. Counseling Psychology'],
    experience: 8,
    consultationFee: 4000,
    bio: 'Focused on relationship issues, marriage counseling, and couple therapy.',
    services: ['Couples Therapy', 'Marriage Counseling', 'Relationship Coaching'],
    rating: 4.6,
    totalReviews: 134
  },
  {
    name: 'Dr. Aruna Dissanayake',
    email: 'dr.aruna.dissa@mindhaven.lk',
    phone: '0112678901',
    address: 'Kurunegala, Sri Lanka',
    dateOfBirth: new Date(1986, 11, 3),
    gender: 'female',
    specialization: 'Stress Management',
    licenseNumber: 'SL-PSY-2012-005',
    qualification: ['Ph.D. Health Psychology', 'M.Sc. Clinical Psychology'],
    experience: 12,
    consultationFee: 4500,
    bio: 'Specializes in stress, burnout, and workplace mental health issues.',
    services: ['Stress Management', 'Mindfulness Training', 'Corporate Counseling'],
    rating: 4.8,
    totalReviews: 178
  },
  {
    name: 'Dr. Chanaka Silva',
    email: 'dr.chanaka.silva@mindhaven.lk',
    phone: '0112789012',
    address: 'Matara, Sri Lanka',
    dateOfBirth: new Date(1984, 4, 20),
    gender: 'male',
    specialization: 'Addiction Counseling',
    licenseNumber: 'SL-PSY-2011-006',
    qualification: ['M.D. Addiction Medicine', 'Diploma in Addiction Counseling'],
    experience: 13,
    consultationFee: 5500,
    bio: 'Expert in substance abuse treatment and addiction recovery programs.',
    services: ['Addiction Therapy', 'Substance Abuse Counseling', 'Recovery Support'],
    rating: 4.5,
    totalReviews: 142
  },
  {
    name: 'Dr. Niluka Rathnayake',
    email: 'dr.niluka.rathna@mindhaven.lk',
    phone: '0112890123',
    address: 'Anuradhapura, Sri Lanka',
    dateOfBirth: new Date(1989, 1, 14),
    gender: 'female',
    specialization: 'Anxiety Disorders',
    licenseNumber: 'SL-PSY-2015-007',
    qualification: ['Ph.D. Clinical Psychology', 'M.Sc. Anxiety & Mood Disorders'],
    experience: 9,
    consultationFee: 4200,
    bio: 'Specialized in treating anxiety disorders, panic attacks, and phobias.',
    services: ['Anxiety Treatment', 'Panic Disorder Therapy', 'Exposure Therapy'],
    rating: 4.9,
    totalReviews: 221
  },
  {
    name: 'Dr. Ishara Bandara',
    email: 'dr.ishara.bandara@mindhaven.lk',
    phone: '0112901234',
    address: 'Jaffna, Sri Lanka',
    dateOfBirth: new Date(1987, 8, 29),
    gender: 'male',
    specialization: 'PTSD & Trauma',
    licenseNumber: 'SL-PSY-2013-008',
    qualification: ['Ph.D. Trauma Psychology', 'M.Sc. PTSD Treatment'],
    experience: 11,
    consultationFee: 5000,
    bio: 'Expert in post-traumatic stress disorder and trauma-focused therapy.',
    services: ['PTSD Treatment', 'Trauma Therapy', 'EMDR Therapy'],
    rating: 4.7,
    totalReviews: 167
  },
  {
    name: 'Dr. Tharanga Gunasekara',
    email: 'dr.tharanga.guna@mindhaven.lk',
    phone: '0113012345',
    address: 'Colombo 07, Sri Lanka',
    dateOfBirth: new Date(1991, 10, 7),
    gender: 'female',
    specialization: 'Mindfulness & Meditation',
    licenseNumber: 'SL-PSY-2017-009',
    qualification: ['M.Phil. Mindfulness-Based Therapies', 'B.Sc. Psychology'],
    experience: 7,
    consultationFee: 3800,
    bio: 'Integrates mindfulness practices with cognitive therapy for holistic healing.',
    services: ['Mindfulness Therapy', 'Meditation Coaching', 'Stress Reduction'],
    rating: 4.8,
    totalReviews: 145
  },
  {
    name: 'Dr. Lasith Wickramasinghe',
    email: 'dr.lasith.wickrama@mindhaven.lk',
    phone: '0113123456',
    address: 'Gampaha, Sri Lanka',
    dateOfBirth: new Date(1983, 3, 16),
    gender: 'male',
    specialization: 'Cognitive Behavioral Therapy',
    licenseNumber: 'SL-PSY-2009-010',
    qualification: ['Ph.D. Cognitive Psychology', 'M.Sc. CBT', 'B.A. Psychology'],
    experience: 15,
    consultationFee: 5200,
    bio: 'Highly experienced CBT practitioner specializing in depression and anxiety.',
    services: ['CBT', 'Depression Treatment', 'Behavioral Modification'],
    rating: 4.9,
    totalReviews: 198
  }
];

const create10Doctors = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Creating 10 Sri Lankan doctor/counsellor accounts...\n');

    // Hash password (same for all: "doctor123")
    const hashedPassword = await bcrypt.hash('doctor123', 10);

    const createdDoctors = [];
    let successCount = 0;
    let skippedCount = 0;

    for (const doctorData of sriLankanDoctors) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: doctorData.email });
        
        if (existingUser) {
          console.log(`⏭️  Skipped (already exists): ${doctorData.name} - ${doctorData.email}`);
          skippedCount++;
          createdDoctors.push({ ...doctorData, status: 'exists' });
        } else {
          // Create doctor user account
          const newUser = await User.create({
            email: doctorData.email,
            password: hashedPassword,
            name: doctorData.name,
            userType: 'doctor',
            phone: doctorData.phone,
            address: doctorData.address,
            dateOfBirth: doctorData.dateOfBirth,
            gender: doctorData.gender
          });
          
          // Create doctor profile
          const newDoctor = await Doctor.create({
            userId: newUser._id,
            specialization: doctorData.specialization,
            licenseNumber: doctorData.licenseNumber,
            qualification: doctorData.qualification,
            experience: doctorData.experience,
            consultationFee: doctorData.consultationFee,
            bio: doctorData.bio,
            services: doctorData.services,
            rating: doctorData.rating,
            totalReviews: doctorData.totalReviews,
            isVerified: true
          });
          
          console.log(`✅ Created: ${doctorData.name} - ${doctorData.email}`);
          successCount++;
          createdDoctors.push({ ...doctorData, status: 'created' });
        }
      } catch (error) {
        console.log(`❌ Failed: ${doctorData.name} - ${error.message}`);
      }
    }

    // Generate README content
    const readmeContent = `# Mind Haven - Doctor/Counsellor Test Accounts

## Sri Lankan Counsellor Accounts

**Default Password for All Doctor Accounts:** \`doctor123\`

Total Doctors: ${sriLankanDoctors.length}
- ✅ Successfully Created: ${successCount}
- ⏭️  Already Existed: ${skippedCount}

---

## Doctor Login Credentials

| # | Name | Email | Password | Specialization | Experience | Fee (LKR) |
|---|------|-------|----------|----------------|------------|-----------|
${sriLankanDoctors.map((doc, index) => 
  `| ${index + 1} | ${doc.name} | ${doc.email} | doctor123 | ${doc.specialization} | ${doc.experience} yrs | ${doc.consultationFee} |`
).join('\n')}

---

## Quick Copy Login Credentials

### Format: email / password

\`\`\`
${sriLankanDoctors.map(doc => `${doc.email} / doctor123`).join('\n')}
\`\`\`

---

## Detailed Doctor Profiles

${sriLankanDoctors.map((doc, index) => `### ${index + 1}. ${doc.name}

**Login Credentials:**
- **Email:** ${doc.email}
- **Password:** doctor123

**Professional Details:**
- **Specialization:** ${doc.specialization}
- **License Number:** ${doc.licenseNumber}
- **Experience:** ${doc.experience} years
- **Consultation Fee:** LKR ${doc.consultationFee}
- **Rating:** ${doc.rating}/5.0 (${doc.totalReviews} reviews)
- **Verified:** ✅ Yes

**Qualifications:**
${doc.qualification.map(q => `- ${q}`).join('\n')}

**Services Offered:**
${doc.services.map(s => `- ${s}`).join('\n')}

**Bio:**
${doc.bio}

**Contact:**
- Phone: ${doc.phone}
- Location: ${doc.address}

---
`).join('\n')}

## Summary by Specialization

- **Clinical Psychology:** Dr. Pradeep Jayasuriya, Dr. Niluka Rathnayake
- **Child Psychology:** Dr. Samanthi Wijesinghe
- **Psychiatry:** Dr. Ruwan Perera
- **Relationship Counseling:** Dr. Madhavi Fernando
- **Stress Management:** Dr. Aruna Dissanayake
- **Addiction Counseling:** Dr. Chanaka Silva
- **Anxiety Disorders:** Dr. Niluka Rathnayake
- **PTSD & Trauma:** Dr. Ishara Bandara
- **Mindfulness & Meditation:** Dr. Tharanga Gunasekara
- **Cognitive Behavioral Therapy:** Dr. Lasith Wickramasinghe

---

## Usage Instructions

### Login as Doctor/Counsellor

1. Go to: http://localhost:3000/pages/login
2. Enter any email from the list above
3. Enter password: \`doctor123\`
4. Click "Sign In"
5. You'll be redirected to the **Counsellor Dashboard**

### Access Doctor Dashboard

After login, you'll have access to:
- View and manage appointments
- Respond to messages from patients
- Update availability schedule
- View patient reviews
- Manage profile information

---

## Additional Test Accounts

### Regular User Account
- **Email:** user@test.com
- **Password:** password123
- **Type:** Regular User

### Sample Doctor Account  
- **Email:** doctor@test.com
- **Password:** password123
- **Type:** Doctor/Counsellor

---

**Generated on:** ${new Date().toLocaleString()}
**Database:** Mind Haven MongoDB Atlas
**Total Doctors:** ${sriLankanDoctors.length}
`;

    // Write to README file
    fs.writeFileSync('DOCTOR_ACCOUNTS_README.md', readmeContent);
    console.log('\n📄 Doctor login details saved to: DOCTOR_ACCOUNTS_README.md');

    console.log('\n✅ Doctor account creation complete!');
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Already existed: ${skippedCount}`);
    console.log(`   Total doctors: ${sriLankanDoctors.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating doctor accounts:', error.message);
    process.exit(1);
  }
};

create10Doctors();
