import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { LogOut, Lock, Users, AlertTriangle, Clock } from 'lucide-react';

export default function EvaluatorDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [movements, setMovements] = useState([]);
    const [error, setError] = useState('');

    const loadActiveMovements = async () => {
        try {
            setError('');
            const data = await api.getActiveMovements();
            setMovements(data);
        } catch (err) {
            console.error('Failed to load active movements', err);
            setError('Failed to load active movements.');
        }
    };

    useEffect(() => {
        loadActiveMovements();
        const interval = setInterval(loadActiveMovements, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDateTime = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        return d.toLocaleString();
    };

    const formatTime = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Supervisor Dashboard</h1>
                        <p className="text-slate-500">
                            Real-time view of employees currently out of the office.
                        </p>
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

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Users size={18} />
                            Who is Out
                        </div>
                        <button
                            onClick={loadActiveMovements}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900"
                        >
                            <Clock size={16} />
                            Refresh
                        </button>
                    </div>

                    {movements.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <p>No employees are currently out of the office.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                                        <th className="px-3 py-2">Employee</th>
                                        <th className="px-3 py-2">Department</th>
                                        <th className="px-3 py-2">Category</th>
                                        <th className="px-3 py-2">Destination</th>
                                        <th className="px-3 py-2">Reason</th>
                                        <th className="px-3 py-2">Left At</th>
                                        <th className="px-3 py-2">Expected Back</th>
                                        <th className="px-3 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((m) => (
                                        <tr key={m.id} className="border-t border-slate-100">
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">
                                                    {m.employeeName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ID: {m.employeeId}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {m.department || '-'}
                                            </td>
                                            <td className="px-3 py-2 capitalize whitespace-nowrap">
                                                {m.category === 'work' ? 'Work-related' : 'Personal'}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {m.destination}
                                            </td>
                                            <td className="px-3 py-2 max-w-xs truncate" title={m.reason}>
                                                {m.reason}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {formatDateTime(m.departureTimestamp)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {formatTime(m.expectedReturnTime)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {m.currentStatus === 'OVERDUE' ? (
                                                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                        <AlertTriangle size={14} className="mr-1" />
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                        On Time
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
