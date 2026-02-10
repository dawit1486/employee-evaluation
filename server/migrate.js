import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { Evaluation } from './models/Evaluation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const migrate = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI is not defined in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(DB_FILE)) {
            console.error('db.json not found');
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

        if (data.users) {
            console.log(`Found ${data.users.length} users to migrate.`);
            for (const user of data.users) {
                const exists = await User.findOne({ id: user.id });
                if (!exists) {
                    await User.create(user);
                    console.log(`Migrated user: ${user.id}`);
                } else {
                    console.log(`User already exists: ${user.id}`);
                }
            }
        }

        if (data.evaluations) {
            console.log(`Found ${data.evaluations.length} evaluations to migrate.`);
            for (const evaluation of data.evaluations) {
                const exists = await Evaluation.findOne({ id: evaluation.id });
                if (!exists) {
                    await Evaluation.create(evaluation);
                    console.log(`Migrated evaluation: ${evaluation.id}`);
                } else {
                    console.log(`Evaluation already exists: ${evaluation.id}`);
                }
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrate();
