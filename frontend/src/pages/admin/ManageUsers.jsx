import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Users, Shield, Briefcase, Trash2,
  ToggleLeft, ToggleRight, AlertCircle, X, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state for creating a new user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    phone: ''
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (err) {
      setError('Failed to load staff accounts. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit the create-user form
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      await api.post('/users', formData);
      // Clear form and refresh list
      setFormData({ name: '', email: '', password: '', role: 'Employee', phone: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle a user's active/inactive status
  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/toggle-status`);
      // Update the specific user in local state
      setUsers(users.map(u =>
        u._id === userId ? { ...u, isActive: data.data.isActive } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Delete a user account
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this account?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
    }
    if (role === 'Employee') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Employee</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Shield className="w-3 h-3" /> Security</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 tracking-tight">Manage Staff</h1>
          <p className="text-slate-400 mt-1">Create and manage Employee and Security Guard accounts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(null); }}
            className="premium-btn premium-btn-primary"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* General error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      {/* Create User Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-slate-200">New Staff Account</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Full Name *</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleFormChange}
                    required placeholder="Jane Smith"
                    className="premium-input bg-slate-900/60 w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Email *</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleFormChange}
                    required placeholder="jane@company.com"
                    className="premium-input bg-slate-900/60 w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Temporary Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password} onChange={handleFormChange}
                      required placeholder="Min. 6 characters" minLength={6}
                      className="premium-input bg-slate-900/60 w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Role *</label>
                  <select
                    name="role" value={formData.role} onChange={handleFormChange}
                    className="premium-input bg-slate-900/60 w-full text-slate-300 appearance-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Security">Security Guard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Phone (optional)</label>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                    className="premium-input bg-slate-900/60 w-full"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="premium-btn premium-btn-primary w-full"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-slate-200">Staff Accounts</h2>
          <span className="ml-auto text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50">
            {users.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Loading staff accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-700/50">Name</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Email</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Role</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Status</th>
                  <th className="px-6 py-4 border-b border-slate-700/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-700/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle active status */}
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={user.isActive ? 'Disable account' : 'Enable account'}
                        >
                          {user.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        {/* Delete user */}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                      <p>No staff accounts found. Create one above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
