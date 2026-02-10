import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Evaluation } from './models/Evaluation.js';

dotenv.config();

const checkEvaluation = async () => {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const evaluations = await Evaluation.find({});
    console.log(`Total evaluations: ${evaluations.length}`);
    evaluations.forEach(e => console.log(`- ID: ${e.id}, Status: ${e.status}`));

    process.exit(0);
};

checkEvaluation();
