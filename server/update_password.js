import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const updatePassword = async () => {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const result = await User.findOneAndUpdate(
        { id: 'hr01' },
        { password: 'hr' },
        { new: true }
    );

    if (result) {
        console.log(`\nPassword updated for user hr01`);
        console.log(`- ID: ${result.id}`);
        console.log(`- Name: ${result.name}`);
        console.log(`- Role: ${result.role}`);
        console.log(`- New Password: ${result.password}`);
    } else {
        console.log('User hr01 not found');
    }

    process.exit(0);
};

updatePassword();
