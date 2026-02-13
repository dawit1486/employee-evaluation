import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Download, FileText, Loader2, Search, Filter } from 'lucide-react';

export default function MovementReports() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        fromDate: '',
        toDate: ''
    });

    const loadMovements = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await api.getMovements({
                department: filters.department || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined
            });
            setMovements(data);
        } catch (err) {
            console.error('Failed to load movement reports', err);
            setError('Failed to load movement reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMovements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        loadMovements();
    };

    const filteredMovements = movements.filter((m) => {
        const term = searchTerm.toLowerCase();
        return (
            m.employeeName?.toLowerCase().includes(term) ||
            m.department?.toLowerCase().includes(term) ||
            m.destination?.toLowerCase().includes(term)
        );
    });

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

    const exportCSV = () => {
        if (!filteredMovements.length) return;

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

        const rows = filteredMovements.map((m) => {
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
                m.reason.replace(/\r?\n/g, ' '),
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
        const today = new Date().toISOString().split('T')[0];
        link.download = `movement_reports_${today}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading movement reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Movement Reports</h2>
                    <p className="text-sm text-slate-500">
                        View and export employee out-of-office history.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by employee, dept, destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-72 text-sm"
                        />
                    </div>
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 items-end bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm w-full md:w-auto">
                    <Filter size={16} />
                    Filters
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Department
                    </label>
                    <input
                        type="text"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Finance"
                    />
                </div>
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
                    Apply
                </button>
            </div>

            {filteredMovements.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No movement records found for the selected filters.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 font-semibold text-slate-700">Employee</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Department</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Destination</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Reason</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Departure</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Expected</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Return</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements.map((m) => {
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

                                    const statusLabel =
                                        status === 'OVERDUE'
                                            ? 'Overdue'
                                            : status === 'ON_TIME'
                                                ? 'On Time'
                                                : 'Out';

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">
                                                    {m.employeeName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ID: {m.employeeId}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {m.department || '-'}
                                            </td>
                                            <td className="px-4 py-3 capitalize whitespace-nowrap">
                                                {m.category === 'work' ? 'Work-related' : 'Personal'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {m.destination}
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate" title={m.reason}>
                                                {m.reason}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatDateTime(m.departureTimestamp)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatTime(m.expectedReturnTime)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {m.actualReturnTimestamp ? formatTime(m.actualReturnTimestamp) : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}
                                                >
                                                    {statusLabel}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

