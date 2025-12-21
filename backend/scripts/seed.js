const mongoose = require('mongoose');
const path = require('path');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const dotenv = require('dotenv');

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    // NOTE: Password hashing is done by User model pre-save hook, so don't hash here
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',  // Will be hashed by pre-save hook
      role: 'admin',
      department: 'administration',
      phone: '+12125551234',
      isActive: true
    });
    console.log('✅ Created admin user');

    // Create staff user
    // NOTE: Password hashing is done by User model pre-save hook, so don't hash here
    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@example.com',
      password: 'password',  // Will be hashed by pre-save hook
      role: 'staff',
      department: 'computer science',
      phone: '+12125555678',
      isActive: true
    });
    console.log('✅ Created staff user');

    // Create sample students
    // NOTE: Password hashing is done by User model pre-save hook, so don't hash here
    const students = [];
    
    const studentData = [
      {
        name: 'John Doe',
        email: 'student1@example.com',
        studentId: 'S2023001',
        department: 'computer science'
      },
      {
        name: 'Jane Smith',
        email: 'student2@example.com',
        studentId: 'S2023002',
        department: 'electrical engineering'
      },
      {
        name: 'Bob Johnson',
        email: 'student3@example.com',
        studentId: 'S2023003',
        department: 'mechanical engineering'
      }
    ];

    for (const data of studentData) {
      const student = await User.create({
        ...data,
        password: 'password',  // Will be hashed by pre-save hook
        role: 'student',
        isActive: true
      });
      students.push(student);
      console.log(`✅ Created student: ${data.name}`);
    }

    // Create sample complaints
    const complaints = [
      {
        title: 'Verbal Ragging Incident in Hostel A',
        description: 'A senior student repeatedly used threatening and humiliating language toward juniors in Hostel A during late hours. Victims are afraid to report in person. Immediate support and protection is requested.',
        category: 'ragging-verbal',
        priority: 'urgent',
        department: 'hostel',
        status: 'pending',
        student: students[0]._id
      },
      {
        title: 'Group Initiation Abuse in Study Group',
        description: 'New members were coerced into humiliating tasks during a group initiation. Several students expressed fear and some injuries were reported.',
        category: 'ragging-group',
        priority: 'high',
        department: 'computer science',
        status: 'in-progress',
        student: students[0]._id,
        assignedTo: staff._id,
        responses: [{
          responder: staff._id,
          response: 'We are coordinating with the student affairs office to provide support and investigate the incident.',
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        }]
      },
      {
        title: 'Physical Assault Outside Lecture Hall',
        description: 'A student was physically assaulted by seniors outside the lecture hall after class. Medical attention was needed; requesting urgent investigation and protection.',
        category: 'ragging-physical',
        priority: 'urgent',
        department: 'electrical engineering',
        status: 'resolved',
        student: students[1]._id,
        assignedTo: staff._id,
        resolvedAt: new Date(Date.now() - 172800000), // 2 days ago
        responses: [{
          responder: staff._id,
          response: 'Medical support arranged and perpetrators suspended pending investigation.',
          createdAt: new Date(Date.now() - 259200000) // 3 days ago
        }]
      },
      {
        title: 'Sexual Harassment Report in Hostel C',
        description: 'Inappropriate sexual advancement and comments by a senior in Hostel C toward a junior, making them feel unsafe. Confidential handling requested.',
        category: 'ragging-sexual',
        priority: 'urgent',
        department: 'mechanical engineering',
        status: 'in-progress',
        student: students[2]._id,
        assignedTo: admin._id,
        responses: [{
          responder: admin._id,
          response: 'Confidential support provided; case escalated to disciplinary committee.',
          createdAt: new Date(Date.now() - 43200000) // 12 hours ago
        }]
      },
      {
        title: 'Cyberbullying & Threats in Group Chat',
        description: 'A batch of threatening messages and doxxing occurred on social media/group chat targeting new students. Immediate digital evidence preservation requested.',
        category: 'ragging-cyber',
        priority: 'high',
        department: 'hostel',
        status: 'pending',
        student: students[0]._id
      }
    ];

    for (const complaint of complaints) {
      await Complaint.create(complaint);
      console.log(`✅ Created complaint: ${complaint.title}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@example.com / password');
    console.log('Staff: staff@example.com / password');
    console.log('Student 1: student1@example.com / password');
    console.log('Student 2: student2@example.com / password');
    console.log('Student 3: student3@example.com / password');
    console.log('\n🚀 You can now start the application!');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 MongoDB Atlas connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

seedDatabase();