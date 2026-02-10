import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const checkPassword = async () => {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ id: 'hr01' });
    if (user) {
        console.log(`\nUser found:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Password: ${user.password}`);
    } else {
        console.log('User hr01 not found');
    }

    process.exit(0);
};

checkPassword();
