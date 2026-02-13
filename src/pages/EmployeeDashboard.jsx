import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { LogOut, Lock, MapPin, Clock, CheckCircle2, History } from 'lucide-react';

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [currentMovement, setCurrentMovement] = useState(null);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({
        category: 'work',
        destination: '',
        reason: '',
        expectedReturnTime: ''
    });
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = async () => {
        if (!user?.id) return;
        try {
            setError('');
            // Active movement (if any)
            const active = await api.getMovements({ employeeId: user.id });
            const [latestActive] = active.filter(m => !m.actualReturnTimestamp);
            setCurrentMovement(latestActive || null);

            // History (completed movements)
            const all = active.filter(m => m.actualReturnTimestamp);
            setHistory(all);
        } catch (err) {
            console.error('Failed to load movements', err);
            setError('Failed to load your movement history.');
        }
    };

    useEffect(() => {
        loadData();
        // We intentionally do not auto-refresh very frequently for employees
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckOut = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        try {
            setLoading(true);
            setError('');

            if (!form.destination || !form.reason || !form.expectedReturnTime) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }

            // Build an ISO timestamp using today's date and the selected time
            const now = new Date();
            const [hours, minutes] = form.expectedReturnTime.split(':');
            const expectedReturn = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                Number(hours),
                Number(minutes)
            );

            await api.checkOut({
                employeeId: user.id,
                category: form.category,
                destination: form.destination,
                reason: form.reason,
                expectedReturnTime: expectedReturn.toISOString()
            });

            setForm({
                category: 'work',
                destination: '',
                reason: '',
                expectedReturnTime: ''
            });

            await loadData();
        } catch (err) {
            console.error('Check-out failed', err);
            setError(err.message || 'Failed to check out.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError('');
            await api.checkIn({ employeeId: user.id });
            await loadData();
        } catch (err) {
            console.error('Check-in failed', err);
            setError(err.message || 'Failed to check in.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        if (!user?.id) return;
        try {
            setError('');
            const result = await api.getMovements({
                employeeId: user.id,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined
            });
            const completed = result.filter(m => m.actualReturnTimestamp);
            setHistory(completed);
        } catch (err) {
            console.error('Failed to filter history', err);
            setError('Failed to filter history.');
        }
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

    const currentStatus = () => {
        if (!currentMovement) return 'IN_OFFICE';
        const now = new Date();
        const expected = new Date(currentMovement.expectedReturnTime);
        return now > expected ? 'OVERDUE' : 'OUT_OF_OFFICE';
    };

    const statusLabel = currentStatus();

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Out-of-Office Tracker</h1>
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

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Current status & Check-In/Check-Out */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={18} />
                            Current Status
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">You are currently</p>
                                <p
                                    className={`text-xl font-bold ${statusLabel === 'IN_OFFICE'
                                        ? 'text-emerald-600'
                                        : statusLabel === 'OVERDUE'
                                            ? 'text-red-600'
                                            : 'text-amber-600'
                                        }`}
                                >
                                    {statusLabel === 'IN_OFFICE'
                                        ? 'IN THE OFFICE'
                                        : statusLabel === 'OVERDUE'
                                            ? 'OVERDUE (OUT OF OFFICE)'
                                            : 'OUT OF OFFICE'}
                                </p>
                            </div>
                            {currentMovement && (
                                <div className="text-right text-xs text-slate-500">
                                    <p>Destination: <span className="font-medium text-slate-700">{currentMovement.destination}</span></p>
                                    <p>Expected back: {formatTime(currentMovement.expectedReturnTime)}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            {currentMovement ? (
                                <button
                                    disabled={loading}
                                    onClick={handleCheckIn}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    <CheckCircle2 size={18} />
                                    {loading ? 'Checking In...' : 'Check In'}
                                </button>
                            ) : (
                                <p className="text-xs text-slate-500">
                                    Use the form on the right to log your next trip.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Check-Out form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} />
                            Check-Out Form
                        </h2>
                        {currentMovement ? (
                            <p className="text-sm text-slate-500">
                                You already have an active trip. Please check in before creating a new one.
                            </p>
                        ) : (
                            <form onSubmit={handleCheckOut} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleFormChange}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="work">Work-related</option>
                                        <option value="personal">Personal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Destination
                                    </label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={form.destination}
                                        onChange={handleFormChange}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="e.g. Bank, Site A, Municipality Office"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Reason
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={form.reason}
                                        onChange={handleFormChange}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        rows={3}
                                        placeholder="Briefly describe why you are leaving"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Expected Return Time
                                    </label>
                                    <input
                                        type="time"
                                        name="expectedReturnTime"
                                        value={form.expectedReturnTime}
                                        onChange={handleFormChange}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    <Clock size={18} />
                                    {loading ? 'Submitting...' : 'Check Out'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <History size={18} />
                            Movement History
                        </div>
                        <div className="flex flex-wrap gap-3 items-end">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleFilterChange}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleFilterChange}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            No past movements found for the selected period.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Category</th>
                                        <th className="px-3 py-2">Destination</th>
                                        <th className="px-3 py-2">Reason</th>
                                        <th className="px-3 py-2">Out</th>
                                        <th className="px-3 py-2">Expected Back</th>
                                        <th className="px-3 py-2">Actual Back</th>
                                        <th className="px-3 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((m) => {
                                        const status =
                                            new Date(m.actualReturnTimestamp) >
                                                new Date(m.expectedReturnTime)
                                                ? 'OVERDUE'
                                                : 'IN_OFFICE';
                                        return (
                                            <tr key={m.id} className="border-t border-slate-100">
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {formatDateTime(m.departureTimestamp)}
                                                </td>
                                                <td className="px-3 py-2 capitalize">
                                                    {m.category === 'work' ? 'Work-related' : 'Personal'}
                                                </td>
                                                <td className="px-3 py-2">{m.destination}</td>
                                                <td className="px-3 py-2 max-w-xs truncate" title={m.reason}>
                                                    {m.reason}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {formatTime(m.departureTimestamp)}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {formatTime(m.expectedReturnTime)}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {formatTime(m.actualReturnTimestamp)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${status === 'OVERDUE'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                            }`}
                                                    >
                                                        {status === 'OVERDUE' ? 'Overdue' : 'On Time'}
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

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
