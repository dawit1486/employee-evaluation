import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { LogOut, FileText, CheckCircle, Clock, Lock } from 'lucide-react';

export default function EmployeeDashboard() {
    const [evaluations, setEvaluations] = useState([]);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadEvaluations = async () => {
            if (user?.id) {
                const myEvaluations = await api.getEvaluationsByEmployee(user.id);
                const visibleEvaluations = myEvaluations.filter(e => e.status !== 'DRAFT');
                setEvaluations(visibleEvaluations);
            }
        };
        loadEvaluations();
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openEvaluation = (id) => {
        navigate(`/evaluation/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Evaluations</h1>
                        <p className="text-slate-500">Welcome, {user?.name}</p>
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

                <div className="grid gap-4">
                    {evaluations.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl text-center text-slate-400 shadow-sm">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No evaluations found for review.</p>
                            <p className="text-xs mt-2">Logged in as: {user?.id} ({user?.name})</p>
                        </div>
                    ) : (
                        evaluations.map(evaluation => (
                            <div
                                key={evaluation.id}
                                onClick={() => openEvaluation(evaluation.id)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${evaluation.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {evaluation.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 mb-1">Performance Evaluation</h3>
                                            <p className="text-slate-500 text-sm">Period: {evaluation.periodFrom} - {evaluation.periodTo}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                                                    {evaluation.jobTitle}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${evaluation.status === 'COMPLETED'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {evaluation.status === 'COMPLETED' ? 'Completed' : 'Action Required'}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-2">ID: {evaluation.id}</p>
                                    </div>
                                </div>
                            </div>
                        ))
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
