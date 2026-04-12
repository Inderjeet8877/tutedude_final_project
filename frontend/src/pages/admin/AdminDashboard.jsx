import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Clock, RefreshCw, ArrowRight, Activity, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load dashboard statistics', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading && !stats) return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="font-medium tracking-wide">Initializing Core...</span>
      </div>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
             <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">System Overview</h1>
             <p className="text-slate-400 mt-1 text-sm font-medium">Real-time facility telemetry and logic parameters</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchStats} 
            className="flex items-center justify-center gap-2 p-3 sm:px-4 sm:py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all hover:shadow-lg shadow-black/20"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
          <Link to="/admin/visitors" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
            <span>Visitor Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Expected Today', value: stats?.totalVisitors || 0, icon: Users, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', bg: 'bg-blue-500/10 text-blue-400' },
          { title: 'Active (Inside)', value: stats?.activeVisitors || 0, icon: UserCheck, color: 'from-emerald-400 to-teal-400', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10 text-emerald-400' },
          { title: 'Total Appointments', value: stats?.todayAppointments || 0, icon: Calendar, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20', bg: 'bg-purple-500/10 text-purple-400' },
          { title: 'Pending Approval', value: stats?.pendingAppointments || 0, icon: Clock, color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20', bg: 'bg-amber-500/10 text-amber-400' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <Icon className="w-24 h-24 text-white" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
                <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">{stat.title}</p>
              </div>
              {/* Bottom gradient border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-50`} />
            </motion.div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Live Security Checkpoints</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {stats?.recentLogs?.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={log._id} 
              className="px-6 py-5 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${log.checkOutTime ? 'bg-slate-500 shadow-slate-500' : 'bg-green-500 shadow-green-500'}`} />
                <div>
                  <p className="text-base font-semibold text-slate-200">{log.visitor?.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">Authorizing Guard: <span className="text-slate-400">{log.securityGuard?.name}</span></p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  log.checkOutTime 
                    ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' 
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                  {log.checkOutTime ? 'Departed' : 'Arrived Inside'}
                </span>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  {new Date(log.checkOutTime || log.checkInTime).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
          {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-slate-300 font-medium text-lg">No Activity Yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">There have been no physical check-ins or check-outs recorded at the facility gates today.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
