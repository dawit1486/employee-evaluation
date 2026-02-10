import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    employeeId: { type: String },
    employeeName: String,
    jobTitle: String,
    department: String,
    periodFrom: String,
    periodTo: String,
    ratings: { type: Map, of: Number },
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING_EMPLOYEE', 'PENDING_SUPERVISOR', 'COMPLETED'],
        default: 'DRAFT'
    },
    createdBy: { type: String }, // Supervisor/Evaluator ID
    assignedEvaluatorId: { type: String }, // Assigned evaluator for this employee
    supervisorComments: String,
    employeeAgreement: { type: String, enum: ['agree', 'disagree', ''] },
    employeeComments: String,
    managerDecision: String,
    signatures: {
        employee: String, // base64 image or null
        supervisor: String, // base64 image or null
        employeeTimestamp: Date,
        supervisorTimestamp: Date
    },
    // Workflow timestamps
    submittedAt: Date, // When supervisor submits to employee
    respondedAt: Date, // When employee responds
    finalizedAt: Date  // When evaluation is completed
}, { timestamps: true });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema);

