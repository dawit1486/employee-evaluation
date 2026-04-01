import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { generateMovementHistoryPDF } from '../services/pdfService';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { LogOut, Lock, Users, AlertTriangle, Clock, Download, Search, Filter, FileText } from 'lucide-react';

export default function EvaluatorDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('whoIsOut');
    const [movements, setMovements] = useState([]);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        fromDate: '',
        toDate: ''
    });
    const [error, setError] = useState('');

    const loadActiveMovements = useCallback(async () => {
        try {
            setError('');
            const data = await api.getActiveMovements();
            setMovements(data);
        } catch (err) {
            console.error('Failed to load active movements', err);
            setError('Failed to load active movements.');
        }
    }, []);

    const loadMovementHistory = useCallback(async () => {
        try {
            setError('');
            const data = await api.getMovements({
                department: filters.department || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined
            });
            setHistory(data);
        } catch (err) {
            console.error('Failed to load movement history', err);
            setError('Failed to load movement history.');
        }
    }, [filters.department, filters.fromDate, filters.toDate]);

    useEffect(() => {
        if (activeTab === 'whoIsOut') {
            loadActiveMovements();
        } else {
            loadMovementHistory();
        }
    }, [activeTab, loadActiveMovements, loadMovementHistory]);

    useEffect(() => {
        const refreshCurrentTab = () => {
            if (activeTab === 'whoIsOut') {
                loadActiveMovements();
            } else {
                loadMovementHistory();
            }
        };

        refreshCurrentTab();

        const interval = setInterval(
            refreshCurrentTab,
            activeTab === 'whoIsOut' ? 10000 : 15000
        );

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshCurrentTab();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [activeTab, loadActiveMovements, loadMovementHistory]);

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredHistory = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return history;
        return history.filter((m) =>
            m.employeeName?.toLowerCase().includes(term) ||
            m.department?.toLowerCase().includes(term) ||
            m.destination?.toLowerCase().includes(term) ||
            m.employeeId?.toLowerCase().includes(term)
        );
    }, [history, searchTerm]);

    const exportCSV = () => {
        if (!filteredHistory.length) return;

        const header = [
            'Employee ID',
            'Employee Name',
            'Department',
            'Category',
            'Destination',
            'Reason',
            'Departure',
            'Expected Return',
            'Actual Return',
            'Status'
        ];

        const rows = filteredHistory.map((m) => {
            const status =
                m.actualReturnTimestamp &&
                new Date(m.actualReturnTimestamp) > new Date(m.expectedReturnTime)
                    ? 'OVERDUE'
                    : m.actualReturnTimestamp
                        ? 'ON_TIME'
                        : 'OUT';

            return [
                m.employeeId,
                m.employeeName,
                m.department || '',
                m.category,
                m.destination,
                (m.reason || '').replace(/\r?\n/g, ' '),
                formatDateTime(m.departureTimestamp),
                formatDateTime(m.expectedReturnTime),
                formatDateTime(m.actualReturnTimestamp),
                status
            ];
        });

        const csvContent = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `management_movement_history_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        if (!filteredHistory.length) return;
        generateMovementHistoryPDF(filteredHistory, 'Management Movement History Report');
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

                <div className="mb-4 flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('whoIsOut')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'whoIsOut'
                            ? 'border-b-2 border-indigo-600 text-indigo-700'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                    >
                        Who is Out
                    </button>
                    <button
                        onClick={() => setActiveTab('movementHistory')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'movementHistory'
                            ? 'border-b-2 border-indigo-600 text-indigo-700'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                    >
                        Employee Movements
                    </button>
                </div>

                {activeTab === 'whoIsOut' ? (
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
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search employee, dept, destination..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                <Filter size={16} />
                                Filters
                            </div>

                            <input
                                type="text"
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                                placeholder="Department"
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <button
                                type="button"
                                onClick={loadMovementHistory}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900"
                            >
                                <Clock size={16} />
                                Refresh
                            </button>
                            <button
                                type="button"
                                onClick={exportCSV}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                            <button
                                type="button"
                                onClick={exportPDF}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                                <FileText size={16} />
                                Export PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {filteredHistory.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <FileText size={44} className="mx-auto mb-3 opacity-25" />
                                    <p>No movement history found for the selected filters.</p>
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
                                                <th className="px-3 py-2">Departure</th>
                                                <th className="px-3 py-2">Expected</th>
                                                <th className="px-3 py-2">Return</th>
                                                <th className="px-3 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistory.map((m) => {
                                                const status =
                                                    m.actualReturnTimestamp &&
                                                        new Date(m.actualReturnTimestamp) > new Date(m.expectedReturnTime)
                                                        ? 'OVERDUE'
                                                        : m.actualReturnTimestamp
                                                            ? 'ON_TIME'
                                                            : 'OUT';

                                                const statusClasses =
                                                    status === 'OVERDUE'
                                                        ? 'bg-red-50 text-red-700'
                                                        : status === 'ON_TIME'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-amber-50 text-amber-700';

                                                return (
                                                    <tr key={m.id} className="border-t border-slate-100">
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="font-medium text-slate-900">
                                                                {m.employeeName}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                ID: {m.employeeId}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{m.department || '-'}</td>
                                                        <td className="px-3 py-2 capitalize whitespace-nowrap">
                                                            {m.category === 'work' ? 'Work-related' : 'Personal'}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{m.destination}</td>
                                                        <td className="px-3 py-2 max-w-xs truncate" title={m.reason}>{m.reason}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(m.departureTimestamp)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatTime(m.expectedReturnTime)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            {m.actualReturnTimestamp ? formatTime(m.actualReturnTimestamp) : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}>
                                                                {status === 'OVERDUE' ? 'Overdue' : status === 'ON_TIME' ? 'On Time' : 'Out'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
