import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, XCircle, Send, Plus, RefreshCw, Briefcase, User as UserIcon } from 'lucide-react';

const EmployeeDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.data);
    } catch (error) {
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const handleIssuePass = async (id) => {
    try {
      await api.post(`/passes/issue/${id}`);
      fetchAppointments();
      // Optional: Add a toast notification here
      alert('Digital Pass successfully generated and dispatched via email!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to issue pass');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</span>;
      case 'Rejected': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'Completed': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>;
      case 'Pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      default: 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{status}</span>;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">My Appointments</h1>
          <p className="text-slate-400 mt-1">Manage physical visits explicitly routed to you.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAppointments}
            className="p-2 sm:px-4 sm:py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all shadow-black/20 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <Link 
            to="/employee/appointments/request" 
            className="premium-btn premium-btn-primary"
          >
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </Link>
        </div>
      </div>

      {loading && appointments.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
           <div className="flex items-center gap-3 text-indigo-400">
             <RefreshCw className="w-6 h-6 animate-spin" />
             <span className="font-medium tracking-wide">Loading Schedule...</span>
           </div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {appointments.map((apt) => (
            <motion.div key={apt._id} variants={itemVariants} className="glass-card flex flex-col overflow-hidden group">
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-200">{apt.visitor?.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      <span>{apt.visitor?.company || 'Independent'}</span>
                    </div>
                  </div>
                </div>
              </div>

               {/* Body */}
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{new Date(apt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{apt.time}</span>
                  </div>
                </div>
                
                <div className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/30 border-l-2 border-l-indigo-500">
                  <p className="text-sm text-slate-400 line-clamp-2" title={apt.purpose}>{apt.purpose}</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Current Status</span>
                  {getStatusBadge(apt.status)}
                </div>
              </div>

               {/* Actions Floor */}
              <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50">
                {apt.status === 'Pending' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(apt._id, 'Approved')}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 font-medium py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(apt._id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-medium py-2 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.98]"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
                {apt.status === 'Approved' && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleIssuePass(apt._id)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-medium py-2.5 rounded-xl transition-all hover:shadow-purple-500/40 active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" /> Dispatch Pass Email
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                      className="w-full flex items-center justify-center gap-2 text-slate-400 font-medium py-2 rounded-xl hover:text-slate-200 transition-colors text-sm"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
                {apt.status === 'Completed' && (
                   <div className="py-2 text-center text-sm font-medium text-slate-500">
                     Interaction Concluded
                   </div>
                )}
                 {apt.status === 'Rejected' && (
                   <div className="py-2 text-center text-sm font-medium text-red-500/70 block">
                     Authorization Denied
                   </div>
                )}
              </div>
            </motion.div>
          ))}
          {appointments.length === 0 && (
            <motion.div variants={itemVariants} className="col-span-full py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
              <Calendar className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-lg font-medium text-slate-300">No scheduled appointments</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">You currently have no incoming visitors in your docket. Request an appointment to authorize access to the facility.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
