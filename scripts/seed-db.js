import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../server/models/User.js';
import { Evaluation } from '../server/models/Evaluation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'server', 'db.json');

const seed = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            // Note: Seeding into memory server is temporary and won't persist for the main app
            // unless we can share the instance, which we can't easily do between processes.
            // However, for the USER's local experience, we want to seed the PERMANENT db if possible.
            // If they don't have one, seeding the memory server is useless as it dies with the script.
            // BUT, the main app will start its OWN memory server.
            // So, we should only seed if we have a real URI, OR we should update the main app to seed itself?

            console.log('No MONGO_URI provided. Skipping seed for in-memory usage.');
            console.log('The application will start with an empty in-memory database.');
            process.exit(0);
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(DB_FILE)) {
            console.log('No db.json found');
            process.exit(0);
        }

        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

        // Seed Users
        if (data.users && data.users.length > 0) {
            await User.deleteMany({}); // Clear existing
            await User.insertMany(data.users);
            console.log(`Seeded ${data.users.length} users`);
        }

        // Seed Evaluations
        if (data.evaluations && data.evaluations.length > 0) {
            await Evaluation.deleteMany({}); // Clear existing
            await Evaluation.insertMany(data.evaluations);
            console.log(`Seeded ${data.evaluations.length} evaluations`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();
