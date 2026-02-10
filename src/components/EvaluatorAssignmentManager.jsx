import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function EvaluatorAssignmentManager() {
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [evaluators, setEvaluators] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedEvaluator, setSelectedEvaluator] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentsData, usersData] = await Promise.all([
                api.getEvaluatorAssignments(),
                api.getUsers()
            ]);

            setAssignments(assignmentsData);
            setEmployees(usersData.filter(u => u.role === 'employee'));
            setEvaluators(usersData.filter(u => u.role === 'evaluator'));
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(e => e.id === employeeId);
        return employee?.name || employeeId;
    };

    const getEvaluatorName = (evaluatorId) => {
        const evaluator = evaluators.find(e => e.id === evaluatorId);
        return evaluator?.name || evaluatorId;
    };

    const getAssignedEvaluator = (employeeId) => {
        const assignment = assignments.find(a => a.employeeId === employeeId && a.isActive);
        return assignment ? getEvaluatorName(assignment.evaluatorId) : '-';
    };

    const handleAssign = async () => {
        if (!selectedEmployee || !selectedEvaluator) {
            alert('Please select both an employee and an evaluator');
            return;
        }

        try {
            await api.createEvaluatorAssignment({
                evaluatorId: selectedEvaluator,
                employeeId: selectedEmployee,
                assignedBy: currentUser.id
            });

            setSelectedEmployee('');
            setSelectedEvaluator('');
            await loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRemoveAssignment = async (assignmentId) => {
        if (!confirm('Are you sure you want to remove this assignment?')) return;

        try {
            await api.deleteEvaluatorAssignment(assignmentId);
            await loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const getAssignmentsForEmployee = (employeeId) => {
        return assignments.filter(a => a.employeeId === employeeId && a.isActive);
    };

    return (
        <div>
            {/* Assignment Form */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Create New Assignment</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Select Employee
                        </label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Choose an employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Assign to Evaluator
                        </label>
                        <select
                            value={selectedEvaluator}
                            onChange={(e) => setSelectedEvaluator(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Choose an evaluator...</option>
                            {evaluators.map(evaluator => (
                                <option key={evaluator.id} value={evaluator.id}>
                                    {evaluator.name} ({evaluator.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAssign}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Assign
                    </button>
                </div>
            </div>

            {/* Assignments Overview */}
            <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Current Assignments</h3>

                {/* By Employee */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">Assignments by Employee</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 text-left">
                                    <th className="pb-3 text-sm font-semibold text-slate-700">Employee</th>
                                    <th className="pb-3 text-sm font-semibold text-slate-700">Assigned Evaluator</th>
                                    <th className="pb-3 text-sm font-semibold text-slate-700">Assigned Date</th>
                                    <th className="pb-3 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(employee => {
                                    const employeeAssignments = getAssignmentsForEmployee(employee.id);
                                    if (employeeAssignments.length === 0) {
                                        return (
                                            <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 text-sm text-slate-900">{employee.name}</td>
                                                <td className="py-3 text-sm text-slate-400">No evaluator assigned</td>
                                                <td className="py-3 text-sm text-slate-400">-</td>
                                                <td className="py-3"></td>
                                            </tr>
                                        );
                                    }
                                    return employeeAssignments.map(assignment => (
                                        <tr key={assignment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 text-sm text-slate-900">{employee.name}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={16} className="text-green-600" />
                                                    <span className="text-sm text-slate-900">
                                                        {getEvaluatorName(assignment.evaluatorId)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-slate-600">
                                                {new Date(assignment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => handleRemoveAssignment(assignment.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* By Evaluator */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">Workload by Evaluator</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {evaluators.map(evaluator => {
                            const evaluatorAssignments = assignments.filter(
                                a => a.evaluatorId === evaluator.id && a.isActive
                            );
                            return (
                                <div key={evaluator.id} className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-slate-900">{evaluator.name}</h5>
                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                                            {evaluatorAssignments.length} {evaluatorAssignments.length === 1 ? 'employee' : 'employees'}
                                        </span>
                                    </div>
                                    {evaluatorAssignments.length > 0 ? (
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            {evaluatorAssignments.map(assignment => (
                                                <li key={assignment.id} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                    {getEmployeeName(assignment.employeeId)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400">No assignments yet</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
