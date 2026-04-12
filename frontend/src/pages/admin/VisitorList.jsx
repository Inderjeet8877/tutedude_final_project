import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Users, Plus, Search, MoreVertical, Edit2, Trash2, ShieldAlert } from 'lucide-react';

const VisitorList = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data.data);
    } catch (err) {
      setError('Failed to load visitor directory. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to revoke this pass and delete this visitor?')) {
      try {
        await api.delete(`/visitors/${id}`);
        setVisitors(visitors.filter(v => v._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting visitor');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Expected': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Expected</span>;
      case 'Checked-In': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Inside Facility</span>;
      case 'Checked-Out': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Departed</span>;
      case 'Cancelled': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Revoked</span>;
      default: 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{status}</span>;
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Visitor Fleet</h1>
          <p className="text-slate-400 mt-1">Manage physical access permissions and expected guests.</p>
        </div>
        <Link 
          to="/admin/visitors/add" 
          className="premium-btn premium-btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>Authorize New Visitor</span>
        </Link>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-10 h-11 bg-slate-900/50"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Total: <strong>{filteredVisitors.length}</strong> Records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Retrieving visitor logs...</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-900/80 uppercase text-xs font-semibold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl border-b border-slate-700/50">Subject Identity</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Contact Matrix</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Entity / Org</th>
                  <th className="px-6 py-4 border-b border-slate-700/50">Clearance Status</th>
                  <th className="px-6 py-4 rounded-tr-xl border-b border-slate-700/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredVisitors.map((visitor, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={visitor._id} 
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shadow-inner">
                          {visitor.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-200">{visitor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-300">{visitor.email}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{visitor.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {visitor.company || <span className="text-slate-600 italic">Unspecified</span>}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(visitor.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/visitors/edit/${visitor._id}`} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Edit Record">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(visitor._id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Revoke Pass">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-lg font-medium text-slate-400">No matching subjects found</p>
                        <p className="text-sm">Adjust your search parameters or register a new visitor.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorList;
