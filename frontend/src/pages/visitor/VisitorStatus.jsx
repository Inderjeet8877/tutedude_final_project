import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Calendar, Clock, RefreshCw, LogOut, CheckCircle2, XCircle, AlertTriangle, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const VisitorStatus = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPasses();
  }, []);

  const fetchMyPasses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/passes/my-passes');
      setPasses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch visitor passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Valid': 
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {status}</span>;
      case 'Used': 
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {status}</span>;
      case 'Expired': 
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {status}</span>;
      case 'Revoked': 
        return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
      default: 
        return <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium flex items-center gap-1.5">{status}</span>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[30%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl relative z-10 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Welcome, {user?.name || "Visitor"}
            </h1>
            <p className="text-slate-400 mt-1">Review your upcoming passes and appointments.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchMyPasses}
              className="p-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700 hover:bg-slate-700 transition flex items-center gap-2"
              title="Refresh Passes"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-red-500/10 text-red-400 font-medium rounded-xl border border-red-500/20 hover:bg-red-500/20 transition flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {loading && passes.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-indigo-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="font-medium tracking-wide">Retrieving your passes...</span>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2"
          >
            {passes.map((pass) => (
              <motion.div key={pass._id} variants={itemVariants} className="glass-card flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Visual Status Indicator Line */}
                <div className={`absolute top-0 left-0 w-1 h-full ${pass.status === 'Valid' ? 'bg-emerald-500' : pass.status === 'Used' ? 'bg-slate-500' : 'bg-red-500'}`}></div>

                {/* Left Side: Summary info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                        <UserIcon className="w-3.5 h-3.5" /> Host
                      </div>
                      <h3 className="font-bold text-lg text-slate-200">{pass.appointment?.employee?.name || 'Unknown Employee'}</h3>
                    </div>
                    {getStatusBadge(pass.status)}
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Date</span>
                        <span className="text-sm font-medium">{pass.appointment?.date ? new Date(pass.appointment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Clock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Time</span>
                        <span className="text-sm font-medium">{pass.appointment?.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Code Area */}
                <div className="bg-slate-800/40 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-700/50 shadow-inner">
                  <div className="text-xs text-slate-400 font-semibold mb-3 tracking-wider uppercase">Scan to Enter</div>
                  
                  <div className={`p-3 bg-white rounded-xl ${pass.status !== 'Valid' ? 'opacity-40 grayscale' : ''} shadow-xl`}>
                    {pass.qrCodeUrl ? (
                      <img src={pass.qrCodeUrl} alt="Pass QR Code" className="w-32 h-32 md:w-40 md:h-40" />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                        <QrCode className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Pass Code</span>
                    <span className="font-mono text-lg font-bold text-slate-200 tracking-[0.2em]">{pass.passCode}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {passes.length === 0 && (
              <motion.div variants={itemVariants} className="col-span-full py-16 text-center flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <QrCode className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">No Passes Available</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-md">
                  You currently don't have any generated visitor passes. If you are expecting an appointment, please wait for the host to authorize it.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VisitorStatus;
