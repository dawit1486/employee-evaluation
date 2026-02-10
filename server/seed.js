import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const seedDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-evaluation';

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        if (fs.existsSync(DB_FILE)) {
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

            if (data.users && data.users.length > 0) {
                // Delete existing users to avoid duplicates
                await User.deleteMany({});
                await User.insertMany(data.users);
                console.log(`Successfully seeded ${data.users.length} users.`);
            }
        } else {
            console.error('db.json not found!');
        }

    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
};

seedDB();
