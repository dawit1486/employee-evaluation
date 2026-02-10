import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Plus, FileText, LogOut, Lock } from 'lucide-react';

export default function EvaluatorDashboard() {
    const [evaluations, setEvaluations] = useState([]);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadEvaluations = async () => {
            if (user?.id) {
                try {
                    const myEvaluations = await api.getEvaluationsByEvaluator(user.id);
                    setEvaluations(myEvaluations);
                } catch (error) {
                    console.error('Failed to load evaluations:', error);
                }
            }
        };
        loadEvaluations();
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const createNewEvaluation = () => {
        const newId = Date.now().toString();
        // Navigate to form with new ID
        navigate(`/evaluation/${newId}?mode=create`);
    };

    const openEvaluation = (id) => {
        navigate(`/evaluation/${id}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Completed</span>;
            case 'PENDING_EMPLOYEE':
                return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">Pending Employee</span>;
            case 'PENDING_SUPERVISOR':
                return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Pending Finalization</span>;
            default:
                return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">Draft</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Evaluator Dashboard</h1>
                        <p className="text-slate-500">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            <Lock size={18} />
                            Change Password
                        </button>
                        <div className="w-px h-6 bg-slate-300"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-semibold text-lg text-slate-800">Recent Evaluations</h2>
                        <button
                            onClick={createNewEvaluation}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus size={18} />
                            New Evaluation
                        </button>
                    </div>

                    {evaluations.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No evaluations found. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {evaluations.map(evaluation => (
                                <div
                                    key={evaluation.id}
                                    onClick={() => openEvaluation(evaluation.id)}
                                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                            {evaluation.employeeName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900">{evaluation.employeeName || 'Untitled Evaluation'}</h3>
                                            <p className="text-xs text-slate-500">{evaluation.jobTitle || 'No Job Title'} • {evaluation.department || 'No Dept'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(evaluation.status)}
                                        <span className="text-slate-400 text-sm">{new Date(parseInt(evaluation.id)).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
