import mongoose from 'mongoose';

const evaluatorAssignmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    evaluatorId: { type: String, required: true },
    employeeId: { type: String, required: true },
    assignedBy: { type: String, required: true }, // HR user ID
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const EvaluatorAssignment = mongoose.model('EvaluatorAssignment', evaluatorAssignmentSchema);
