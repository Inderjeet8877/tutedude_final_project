import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, UserSquare2, Calendar, Clock, Edit3, Send } from 'lucide-react';

const RequestAppointment = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({
    visitor: '',
    date: '',
    time: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data } = await api.get('/visitors');
        setVisitors(data.data);
      } catch (err) {
        console.error("Failed to load visitors list.");
      }
    };
    fetchVisitors();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments', formData);
      navigate('/employee/appointments');
    } catch (err) {
      alert('Failed to request appointment');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link to="/employee/appointments" className="p-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Request Authorization</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule an expected visitor arrival in your calendar.</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-20" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Select Active Visitor Identity *</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <UserSquare2 className="w-5 h-5" />
              </div>
              <select 
                name="visitor" 
                value={formData.visitor} 
                onChange={handleChange} 
                required 
                className="premium-input pl-11 bg-slate-900/60 appearance-none text-slate-200"
              >
                <option value="" disabled className="text-slate-500 bg-slate-800">-- Select a registered visitor --</option>
                {visitors.map(v => (
                  <option key={v._id} value={v._id} className="bg-slate-800 text-slate-100">
                    {v.name} ({v.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Expected Date *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                  className="premium-input pl-11 bg-slate-900/60 text-slate-200 uppercase tracking-widest text-sm" 
                  style={{colorScheme: 'dark'}}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Expected Time *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  required 
                  className="premium-input pl-11 bg-slate-900/60 text-slate-200 tracking-widest text-sm"
                  style={{colorScheme: 'dark'}}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Purpose of Visit *</label>
            <div className="relative group">
              <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Edit3 className="w-5 h-5" />
              </div>
              <textarea 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                required 
                rows="3" 
                className="premium-input pl-11 bg-slate-900/60 resize-none h-32 text-slate-200"
                placeholder="Briefly describe the purpose of this facility access..."
              ></textarea>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !formData.visitor || !formData.date || !formData.time || !formData.purpose}
              className="premium-btn premium-btn-primary px-8 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Transmit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default RequestAppointment;
