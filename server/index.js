import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from './models/User.js';
import { Evaluation } from './models/Evaluation.js';
import { EvaluatorAssignment } from './models/EvaluatorAssignment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Connect to MongoDB
const connectDB = async () => {
    let mongoUri = process.env.MONGO_URI;
    let isInMemory = false;

    if (!mongoUri) {
        console.log('No MONGO_URI found. Starting in-memory MongoDB...');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log(`In-memory MongoDB started at ${mongoUri}`);
        isInMemory = true;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        if (isInMemory && fs.existsSync(DB_FILE)) {
            console.log('Seeding in-memory database from db.json...');
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

            if (data.users) await User.insertMany(data.users);
            if (data.evaluations) await Evaluation.insertMany(data.evaluations);
            if (data.evaluatorAssignments) await EvaluatorAssignment.insertMany(data.evaluatorAssignments);

            console.log('Seeding complete.');
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();

// Login
app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;
    try {
        const user = await User.findOne({ id, password });
        if (user) {
            const { password: _, ...userWithoutPass } = user.toObject();
            res.json(userWithoutPass);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Change Password
app.post('/api/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.password !== currentPassword) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Employees
app.get('/api/employees', async (req, res) => {
    const { evaluatorId } = req.query;
    try {
        let employeeIds = null;
        if (evaluatorId) {
            const assignments = await EvaluatorAssignment.find({ evaluatorId, isActive: true });
            employeeIds = assignments.map(a => a.employeeId);
        }

        const query = { role: 'employee' };
        if (employeeIds) {
            query.id = { $in: employeeIds };
        }

        const employees = await User.find(query).select('-password');
        res.json(employees);
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Evaluations
app.get('/api/evaluations', async (req, res) => {
    try {
        console.log('GET /api/evaluations query params:', req.query);
        const { employeeId, evaluatorId, mode } = req.query;
        let query = {};

        if (employeeId) {
            query.employeeId = employeeId;
        } else if (evaluatorId) {
            query = {
                $or: [
                    { createdBy: evaluatorId },
                    { assignedEvaluatorId: evaluatorId }
                ]
            };
        } else if (mode === 'all') {
            // Explicitly requesting all (e.g. for HR)
            query = {};
        } else {
            // Safety fallback: Do not return everything by default
            console.warn('GET /api/evaluations called without filters. Returning empty list.');
            return res.json([]);
        }

        console.log('Mongo Query:', JSON.stringify(query));
        const evaluations = await Evaluation.find(query);
        console.log(`Found ${evaluations.length} evaluations`);
        res.json(evaluations);
    } catch (error) {
        console.error('Get evaluations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Single Evaluation
app.get('/api/evaluations/:id', async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({ id: req.params.id });
        if (evaluation) {
            res.json(evaluation);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Save Evaluation (Create or Update)
app.post('/api/evaluations', async (req, res) => {
    const evaluationData = req.body;
    try {
        console.log('Saving evaluation:', evaluationData);
        const evaluation = await Evaluation.findOneAndUpdate(
            { id: evaluationData.id },
            evaluationData,
            { new: true, upsert: true }
        );
        console.log('Saved evaluation result:', evaluation);
        res.json(evaluation);
    } catch (error) {
        console.error('Save evaluation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit Evaluation to Employee
app.post('/api/evaluations/:id/submit', async (req, res) => {
    try {
        console.log(`Submitting evaluation ${req.params.id} to employee`);
        console.log('Request body keys:', Object.keys(req.body));
        const { supervisorSignature } = req.body;
        if (!supervisorSignature) {
            console.warn('Warning: No supervisor signature provided in request body');
        }
        const evaluation = await Evaluation.findOneAndUpdate(
            { id: req.params.id },
            {
                status: 'PENDING_EMPLOYEE',
                submittedAt: new Date(),
                'signatures.supervisor': supervisorSignature,
                'signatures.supervisorTimestamp': new Date()
            },
            { new: true }
        );
        console.log('Submit result:', evaluation);
        if (!evaluation) {
            console.error('Evaluation not found for ID:', req.params.id);
            return res.status(404).json({ error: 'Evaluation not found' });
        }
        res.json(evaluation);
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Employee Responds to Evaluation
app.post('/api/evaluations/:id/respond', async (req, res) => {
    try {
        const { employeeAgreement, employeeComments, employeeSignature } = req.body;
        const evaluation = await Evaluation.findOneAndUpdate(
            { id: req.params.id },
            {
                status: 'PENDING_SUPERVISOR',
                employeeAgreement,
                employeeComments,
                respondedAt: new Date(),
                'signatures.employee': employeeSignature,
                'signatures.employeeTimestamp': new Date()
            },
            { new: true }
        );
        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }
        res.json(evaluation);
    } catch (error) {
        console.error('Respond error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Finalize Evaluation
app.post('/api/evaluations/:id/finalize', async (req, res) => {
    try {
        const { managerDecision } = req.body;
        const evaluation = await Evaluation.findOneAndUpdate(
            { id: req.params.id },
            {
                status: 'COMPLETED',
                managerDecision,
                finalizedAt: new Date()
            },
            { new: true }
        );
        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }
        res.json(evaluation);
    } catch (error) {
        console.error('Finalize error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== USER MANAGEMENT (HR only) =====

// Get all users (with optional role filter)
app.get('/api/users', async (req, res) => {
    const { role } = req.query;
    try {
        const query = role ? { role } : {};
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new user
app.post('/api/users', async (req, res) => {
    try {
        const userData = req.body;
        const existingUser = await User.findOne({ id: userData.id });
        if (existingUser) {
            return res.status(400).json({ error: 'User ID already exists' });
        }
        const user = new User(userData);
        await user.save();
        const { password: _, ...userWithoutPass } = user.toObject();
        res.json(userWithoutPass);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const userData = req.body;
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            userData,
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password: _, ...userWithoutPass } = user.toObject();
        res.json(userWithoutPass);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== EVALUATOR ASSIGNMENT MANAGEMENT (HR only) =====

// Get all evaluator assignments
app.get('/api/evaluator-assignments', async (req, res) => {
    try {
        const assignments = await EvaluatorAssignment.find({ isActive: true });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get assignments by employee
app.get('/api/evaluator-assignments/employee/:employeeId', async (req, res) => {
    try {
        const assignments = await EvaluatorAssignment.find({
            employeeId: req.params.employeeId,
            isActive: true
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get assignments by evaluator
app.get('/api/evaluator-assignments/evaluator/:evaluatorId', async (req, res) => {
    try {
        const assignments = await EvaluatorAssignment.find({
            evaluatorId: req.params.evaluatorId,
            isActive: true
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create evaluator assignment
app.post('/api/evaluator-assignments', async (req, res) => {
    try {
        const { evaluatorId, employeeId, assignedBy } = req.body;

        // Check if assignment already exists
        const existing = await EvaluatorAssignment.findOne({
            evaluatorId,
            employeeId,
            isActive: true
        });

        if (existing) {
            return res.status(400).json({ error: 'Assignment already exists' });
        }

        const assignment = new EvaluatorAssignment({
            id: Date.now().toString(),
            evaluatorId,
            employeeId,
            assignedBy
        });

        await assignment.save();
        res.json(assignment);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update evaluator assignment
app.put('/api/evaluator-assignments/:id', async (req, res) => {
    try {
        const assignment = await EvaluatorAssignment.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete evaluator assignment (soft delete)
app.delete('/api/evaluator-assignments/:id', async (req, res) => {
    try {
        const assignment = await EvaluatorAssignment.findOneAndUpdate(
            { id: req.params.id },
            { isActive: false },
            { new: true }
        );
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.json({ message: 'Assignment removed successfully' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve static files from the frontend build directory
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log(`Serving static files from ${distPath}`);

    // Handle SPA routing - send all non-API requests to index.html
    app.use((req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
} else {
    console.warn(`Warning: Static files directory ${distPath} not found. Frontend will not be served.`);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

