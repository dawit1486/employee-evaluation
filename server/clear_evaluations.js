import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Evaluation } from './models/Evaluation.js';

dotenv.config();

const clearEvaluations = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-evaluation';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        console.log('Clearing all evaluations...');
        const result = await Evaluation.deleteMany({});
        console.log(`✓ Successfully deleted ${result.deletedCount} evaluation(s)`);

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing evaluations:', error);
        process.exit(1);
    }
};

clearEvaluations();
