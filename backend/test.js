const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const User = require('./src/models/User.model.js');
        const admin = await User.findOne({role: 'Admin'});
        console.log("Admin found:", admin ? admin.email : "None");

        if(!admin) {
           const newAdmin = await User.create({name: 'Admin', email: 'admin@facility.com', password: 'password123', role: 'Admin', phone: '12345678'});
           console.log("Created", newAdmin.email, "pass: password123");
        } else {
           admin.password = 'password123';
           await admin.save();
           console.log("Updated", admin.email, "to pass: password123");
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
