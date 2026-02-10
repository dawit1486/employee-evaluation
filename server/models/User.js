import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['evaluator', 'employee', 'hr'] },
    password: { type: String, required: true },
    department: { type: String },
    jobTitle: { type: String },
    email: { type: String }
});

export const User = mongoose.model('User', userSchema);
