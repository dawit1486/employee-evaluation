import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        role: 'employee',
        password: '',
        department: '',
        jobTitle: '',
        email: ''
    });
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, roleFilter, searchTerm]);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                id: user.id,
                name: user.name,
                role: user.role,
                password: '',
                department: user.department || '',
                jobTitle: user.jobTitle || '',
                email: user.email || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                id: '',
                name: '',
                role: 'employee',
                password: '',
                department: '',
                jobTitle: '',
                email: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.updateUser(editingUser.id, formData);
            } else {
                await api.createUser(formData);
            }
            await loadUsers();
            closeModal();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm(`Are you sure you want to delete user ${userId}?`)) return;

        try {
            await api.deleteUser(userId);
            await loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            hr: 'bg-purple-100 text-purple-700',
            management: 'bg-blue-100 text-blue-700',
            employee: 'bg-green-100 text-green-700'
        };
        const label = role === 'management' ? 'Management' : role.charAt(0).toUpperCase() + role.slice(1);
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[role]}`}>
                {label}
            </span>
        );
    };

    return (
        <div>
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="hr">HR</option>
                        <option value="management">Management</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 text-left">
                            <th className="pb-3 text-sm font-semibold text-slate-700">User ID</th>
                            <th className="pb-3 text-sm font-semibold text-slate-700">Name</th>
                            <th className="pb-3 text-sm font-semibold text-slate-700">Role</th>
                            <th className="pb-3 text-sm font-semibold text-slate-700">Department</th>
                            <th className="pb-3 text-sm font-semibold text-slate-700">Job Title</th>
                            <th className="pb-3 text-sm font-semibold text-slate-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 text-sm text-slate-900">{user.id}</td>
                                <td className="py-3 text-sm text-slate-900">{user.name}</td>
                                <td className="py-3">{getRoleBadge(user.role)}</td>
                                <td className="py-3 text-sm text-slate-600">{user.department || '-'}</td>
                                <td className="py-3 text-sm text-slate-600">{user.jobTitle || '-'}</td>
                                <td className="py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="text-indigo-600 hover:text-indigo-800 p-1"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        No users found
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={editingUser !== null}
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Role
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="management">Management</option>
                                    <option value="hr">HR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
