import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}`);
    users.forEach(u => console.log(`- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}`));

    process.exit(0);
};

checkUsers();
