require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksmart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Create admin user
const createAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@tasksmart.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create new admin user
        const newAdmin = new User({
            name: 'Admin',
            email: 'admin@tasksmart.com',
            password: 'admin123', // You should change this in production
            role: 'admin'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        newAdmin.password = await bcrypt.hash(newAdmin.password, salt);

        // Save admin
        await newAdmin.save();
        console.log('Admin user created successfully');
        process.exit();
    } catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
};

createAdmin(); 