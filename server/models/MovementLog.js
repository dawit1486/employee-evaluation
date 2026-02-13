import mongoose from 'mongoose';

// Employee movement / out-of-office tracking
const movementLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String },

    category: {
        type: String,
        enum: ['work', 'personal'],
        required: true
    }, // "Work-related" or "Personal"

    destination: { type: String, required: true },
    reason: { type: String, required: true },

    // Stored as full Date for simplicity, but front-end
    // will typically send "today + selected time".
    expectedReturnTime: { type: Date, required: true },

    departureTimestamp: { type: Date, required: true },
    actualReturnTimestamp: { type: Date },

    // Derived but also stored for quick querying
    status: {
        type: String,
        enum: ['IN_OFFICE', 'OUT_OF_OFFICE', 'OVERDUE'],
        default: 'OUT_OF_OFFICE'
    }
}, { timestamps: true });

export const MovementLog = mongoose.model('MovementLog', movementLogSchema);

