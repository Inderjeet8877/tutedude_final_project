import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertCircle, Building2, Phone, Mail, User } from 'lucide-react';

const EditVisitor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        const { data } = await api.get(`/visitors/${id}`);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          company: data.data.company || '',
          address: data.data.address || ''
        });
      } catch (err) {
        setError('Failed to fetch visitor details.');
      } finally {
        setFetching(false);
      }
    };
    fetchVisitor();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.put(`/visitors/${id}`, formData);
      navigate('/admin/visitors');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while updating visitor.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64 border-indigo-500">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/visitors" className="p-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Edit Visitor details</h1>
          <p className="text-slate-400 text-sm mt-1">Update digital pass information for the subject.</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-20" />

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 relative z-10">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 shadow-lg shadow-red-500/5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Subject Full Name *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60" 
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Security Dispatch Email *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60" 
                  placeholder="john.doe@external.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Telecom Signature *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60" 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Affiliated Organization (Optional)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <input 
                  type="text" name="company" value={formData.company} onChange={handleChange}
                  className="premium-input pl-11 bg-slate-900/60" 
                  placeholder="Acme Corp LLC"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Logistical Address / Notes (Optional)</label>
            <textarea 
              name="address" value={formData.address} onChange={handleChange} rows="3"
              className="premium-input bg-slate-900/60 resize-none h-32"
              placeholder="Any specific delivery instructions or physical address mappings..."
            ></textarea>
          </div>

          <div className="pt-8 border-t border-slate-700/50 flex justify-end gap-4">
            <Link 
              to="/admin/visitors"
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="premium-btn premium-btn-primary px-8"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditVisitor;
