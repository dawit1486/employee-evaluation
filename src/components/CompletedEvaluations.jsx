import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { generateEvaluationPDF } from '../services/pdfService';
import { FileText, Download, Loader2, Search, CheckCircle, Clock } from 'lucide-react';

export default function CompletedEvaluations() {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadEvaluations = async () => {
            try {
                const results = await api.getAllEvaluations();
                // Filter out DRAFTs for HR view, show everything else (Pending, Completed)
                const visible = results.filter(e => e.status !== 'DRAFT');

                // Sort by date descending
                visible.sort((a, b) => {
                    const dateA = a.finalizedAt ? new Date(a.finalizedAt) : (a.submittedAt ? new Date(a.submittedAt) : new Date(parseInt(a.id)));
                    const dateB = b.finalizedAt ? new Date(b.finalizedAt) : (b.submittedAt ? new Date(b.submittedAt) : new Date(parseInt(b.id)));
                    return dateB - dateA;
                });
                setEvaluations(visible);
            } catch (error) {
                console.error('Failed to load evaluations:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEvaluations();
    }, []);

    const handleDownload = (evaluation) => {
        generateEvaluationPDF(evaluation);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Completed
                    </span>
                );
            case 'PENDING_EMPLOYEE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock size={12} />
                        Pending Employee
                    </span>
                );
            case 'PENDING_SUPERVISOR':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock size={12} />
                        Pending Supervisor
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {status}
                    </span>
                );
        }
    };

    const filteredEvaluations = evaluations.filter(e =>
        e.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Evaluation Reports</h2>
                    <p className="text-sm text-slate-500">View and download all non-draft evaluations</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
                    />
                </div>
            </div>

            {filteredEvaluations.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{searchTerm ? 'No reports match your search.' : 'No evaluations found (excluding drafts).'}</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold text-slate-700">Employee Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Department</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Period</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEvaluations.map((evaluation) => (
                                    <tr key={evaluation.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{evaluation.employeeName || 'Untitled'}</div>
                                            <div className="text-xs text-slate-500">{evaluation.jobTitle || 'No title'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{evaluation.department || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {evaluation.periodFrom || '-'} - {evaluation.periodTo || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(evaluation.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(evaluation)}
                                                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                            >
                                                <Download size={16} />
                                                Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
