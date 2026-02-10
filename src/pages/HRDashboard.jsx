import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, UserCog, Lock, FileCheck } from 'lucide-react';
import UserManagement from '../components/UserManagement';
import EvaluatorAssignmentManager from '../components/EvaluatorAssignmentManager';
import CompletedEvaluations from '../components/CompletedEvaluations';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function HRDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
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

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'users'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Users size={20} />
                                User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'assignments'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <UserCog size={20} />
                                Evaluator Assignments
                            </button>
                            <button
                                onClick={() => setActiveTab('evaluations')}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'evaluations'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <FileCheck size={20} />
                                Evaluation Reports
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'assignments' && <EvaluatorAssignmentManager />}
                        {activeTab === 'evaluations' && <CompletedEvaluations />}
                    </div>
                </div>
            </div>


            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
