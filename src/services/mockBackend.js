
const USERS_KEY = 'ee_users';
const EVALUATIONS_KEY = 'ee_evaluations';

// Initial Mock Data
const INITIAL_USERS = [
    { id: 'admin', name: 'System Admin', role: 'management', password: 'admin' },
    { id: 'emp01', name: 'John Doe', role: 'employee', password: 'emp' },
    { id: 'emp02', name: 'Jane Smith', role: 'employee', password: 'emp' },
];

export const mockBackend = {
    // Auth
    login: async (id, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || JSON.stringify(INITIAL_USERS));
        const user = users.find(u => u.id === id && u.password === password);

        if (user) {
            const { password: _, ...userWithoutPass } = user;
            return userWithoutPass;
        }
        throw new Error('Invalid credentials');
    },

    // Evaluations
    getAllEvaluations: () => {
        return JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
    },

    getEvaluationsByEvaluator: (evaluatorId) => {
        const evaluations = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        return evaluations.filter(e =>
            e.createdBy === evaluatorId || e.assignedEvaluatorId === evaluatorId
        );
    },

    getEvaluationById: (id) => {
        const evaluations = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        return evaluations.find(e => e.id === id);
    },

    getEvaluationsByEmployee: (employeeId) => {
        const evaluations = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        return evaluations.filter(e => e.employeeId === employeeId);
    },

    getEmployees: () => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || JSON.stringify(INITIAL_USERS));
        return users.filter(u => u.role === 'employee').map(u => {
            const { password, ...userWithoutPass } = u;
            return userWithoutPass;
        });
    },

    saveEvaluation: (evaluation) => {
        const evaluations = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        const index = evaluations.findIndex(e => e.id === evaluation.id);

        if (index >= 0) {
            evaluations[index] = evaluation;
        } else {
            evaluations.push(evaluation);
        }

        localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evaluations));
        return evaluation;
    },

    // Initialize if empty
    init: () => {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
        }
    }
};
