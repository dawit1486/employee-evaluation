const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
    // Auth
    login: async (id, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password }),
        });
        if (!response.ok) throw new Error('Invalid credentials');
        return response.json();
    },

    changePassword: async (userId, currentPassword, newPassword) => {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentPassword, newPassword }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to change password');
        }
        return response.json();
    },

    // Evaluations
    getAllEvaluations: async () => {
        const response = await fetch(`${API_URL}/evaluations?mode=all`);
        return response.json();
    },

    getEvaluationsByEvaluator: async (evaluatorId) => {
        if (!evaluatorId) throw new Error('Evaluator ID is required');
        const response = await fetch(`${API_URL}/evaluations?evaluatorId=${evaluatorId}`);
        return response.json();
    },

    getEvaluationById: async (id) => {
        const response = await fetch(`${API_URL}/evaluations/${id}`);
        if (!response.ok) return undefined;
        return response.json();
    },

    getEvaluationsByEmployee: async (employeeId) => {
        const response = await fetch(`${API_URL}/evaluations?employeeId=${employeeId}`);
        return response.json();
    },

    getEmployees: async () => {
        const response = await fetch(`${API_URL}/employees`);
        return response.json();
    },

    saveEvaluation: async (evaluation) => {
        const response = await fetch(`${API_URL}/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluation),
        });
        return response.json();
    },

    // Workflow actions
    submitToEmployee: async (id, supervisorSignature) => {
        const response = await fetch(`${API_URL}/evaluations/${id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supervisorSignature }),
        });
        if (!response.ok) throw new Error('Failed to submit evaluation');
        return response.json();
    },

    respondToEvaluation: async (id, employeeAgreement, employeeComments, employeeSignature) => {
        const response = await fetch(`${API_URL}/evaluations/${id}/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeAgreement, employeeComments, employeeSignature }),
        });
        if (!response.ok) throw new Error('Failed to respond to evaluation');
        return response.json();
    },

    finalizeEvaluation: async (id, managerDecision) => {
        const response = await fetch(`${API_URL}/evaluations/${id}/finalize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ managerDecision }),
        });
        if (!response.ok) throw new Error('Failed to finalize evaluation');
        return response.json();
    },

    // User Management (HR)
    getUsers: async (role = null) => {
        const url = role ? `${API_URL}/users?role=${role}` : `${API_URL}/users`;
        const response = await fetch(url);
        return response.json();
    },

    createUser: async (userData) => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
        }
        return response.json();
    },

    updateUser: async (id, userData) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    // Evaluator Assignments (HR)
    getEvaluatorAssignments: async () => {
        const response = await fetch(`${API_URL}/evaluator-assignments`);
        return response.json();
    },

    getAssignmentsByEmployee: async (employeeId) => {
        const response = await fetch(`${API_URL}/evaluator-assignments/employee/${employeeId}`);
        return response.json();
    },

    getAssignmentsByEvaluator: async (evaluatorId) => {
        const response = await fetch(`${API_URL}/evaluator-assignments/evaluator/${evaluatorId}`);
        return response.json();
    },

    createEvaluatorAssignment: async (assignmentData) => {
        const response = await fetch(`${API_URL}/evaluator-assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create assignment');
        }
        return response.json();
    },

    updateEvaluatorAssignment: async (id, assignmentData) => {
        const response = await fetch(`${API_URL}/evaluator-assignments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData),
        });
        if (!response.ok) throw new Error('Failed to update assignment');
        return response.json();
    },

    deleteEvaluatorAssignment: async (id) => {
        const response = await fetch(`${API_URL}/evaluator-assignments/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete assignment');
        return response.json();
    },

    // Initialize (no-op for real backend)
    init: () => { },

    // ===== Movement / Out-of-Office Tracking =====

    // Employee check-out
    checkOut: async ({ employeeId, category, destination, reason, expectedReturnTime }) => {
        const response = await fetch(`${API_URL}/movements/check-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId,
                category,
                destination,
                reason,
                expectedReturnTime
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to check out');
        }
        return response.json();
    },

    // Employee check-in
    checkIn: async ({ employeeId }) => {
        const response = await fetch(`${API_URL}/movements/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to check in');
        }
        return response.json();
    },

    // Active movements (who is currently out)
    getActiveMovements: async (department = null) => {
        const url = department
            ? `${API_URL}/movements/active?department=${encodeURIComponent(department)}`
            : `${API_URL}/movements/active`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load active movements');
        return response.json();
    },

    // History / reports
    getMovements: async ({ employeeId, department, fromDate, toDate } = {}) => {
        const params = new URLSearchParams();
        if (employeeId) params.append('employeeId', employeeId);
        if (department) params.append('department', department);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);

        const queryString = params.toString();
        const url = queryString ? `${API_URL}/movements?${queryString}` : `${API_URL}/movements`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load movements');
        return response.json();
    }
};
