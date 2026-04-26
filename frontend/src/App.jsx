import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';

import VisitorList from './pages/admin/VisitorList';
import AddVisitor from './pages/admin/AddVisitor';
import EditVisitor from './pages/admin/EditVisitor';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RequestAppointment from './pages/employee/RequestAppointment';

import SecurityScanner from './pages/security/SecurityScanner';

import VisitorStatus from './pages/visitor/VisitorStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Private Routes with Layout */}
          <Route element={
            <PrivateRoute roles={['Admin', 'Employee', 'Security']}>
              <Layout />
            </PrivateRoute>
          }>
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['Admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/visitors" element={
              <PrivateRoute roles={['Admin']}>
                <VisitorList />
              </PrivateRoute>
            } />
            <Route path="/admin/visitors/add" element={
              <PrivateRoute roles={['Admin']}>
                <AddVisitor />
              </PrivateRoute>
            } />
            <Route path="/admin/visitors/edit/:id" element={
              <PrivateRoute roles={['Admin']}>
                <EditVisitor />
              </PrivateRoute>
            } />
            <Route path="/admin/users" element={
              <PrivateRoute roles={['Admin']}>
                <ManageUsers />
              </PrivateRoute>
            } />

            {/* Security Routes */}
            <Route path="/security" element={<Navigate to="/security/scanner" replace />} />
            <Route path="/security/scanner" element={
              <PrivateRoute roles={['Admin', 'Security']}>
                <SecurityScanner />
              </PrivateRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee" element={<Navigate to="/employee/appointments" replace />} />
            <Route path="/employee/appointments" element={
              <PrivateRoute roles={['Admin', 'Employee']}>
                <EmployeeDashboard />
              </PrivateRoute>
            } />
            <Route path="/employee/appointments/request" element={
              <PrivateRoute roles={['Admin', 'Employee']}>
                <RequestAppointment />
              </PrivateRoute>
            } />
          </Route>

          {/* Visitor Routes (Standalone Layout) */}
          <Route path="/visitor" element={<Navigate to="/visitor/status" replace />} />
          <Route path="/visitor/status" element={
            <PrivateRoute roles={['Admin', 'Visitor']}>
              <VisitorStatus />
            </PrivateRoute>
          } />

          {/* Fallback Unauthorized */}
          <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center bg-slate-900 text-xl font-bold text-red-500">Unauthorized Access</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
