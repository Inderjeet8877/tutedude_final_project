import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Users, PlusCircle, Shield, Home, Menu, X, Calendar } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { name: 'Dashboard', to: '/admin/dashboard', icon: Home },
          { name: 'Visitors', to: '/admin/visitors', icon: Users },
          { name: 'Add Visitor', to: '/admin/visitors/add', icon: PlusCircle },
          { name: 'Scanner', to: '/security/scanner', icon: Shield },
          { name: 'My Appointments', to: '/employee/appointments', icon: Calendar },
        ];
      case 'Employee':
        return [
          { name: 'My Appointments', to: '/employee/appointments', icon: Calendar },
          { name: 'Request Appointment', to: '/employee/appointments/request', icon: PlusCircle },
        ];
      case 'Security':
        return [
          { name: 'Check-In/Out Scanner', to: '/security/scanner', icon: Shield },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : 0 }}
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700/50 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Nexus Pass</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          {getNavItems().map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/30'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="hidden sm:block text-xl font-semibold text-slate-100">Welcome, {user?.name}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-700/50 py-1.5 px-3 rounded-full border border-slate-600/50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-inner">
                {user?.name?.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
