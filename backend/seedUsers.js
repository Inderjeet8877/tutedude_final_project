require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User.model');

const seedUsers = async () => {
  try {
    await connectDB();

    const users = [
      {
        name: 'System Admin',
        email: 'admin@system.com',
        password: 'password123',
        role: 'Admin',
        phone: '1112223330',
        isActive: true
      },
      {
        name: 'Head Security',
        email: 'security@system.com',
        password: 'password123',
        role: 'Security',
        phone: '1112223331',
        isActive: true
      },
      {
        name: 'Staff Employee',
        email: 'employee@system.com',
        password: 'password123',
        role: 'Employee',
        phone: '1112223332',
        isActive: true
      },
      {
        name: 'Guest Visitor',
        email: 'visitor@system.com',
        password: 'password123',
        role: 'Visitor',
        phone: '1112223333',
        isActive: true
      }
    ];

    console.log('Seeding users...');
    
    // Iterate and create users to trigger ‘pre save’ hook for password hashing
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`Skipped ${userData.role} (already exists): ${userData.email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error with seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
