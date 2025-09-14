import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import authService from './lib/auth';

// Components
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';

// Pages - End User Portal
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import KYC from './pages/KYC';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';

// Pages - Client Portal
import ClientDashboard from './pages/client/Dashboard';
import ClientTeam from './pages/client/Team';
import ClientSettings from './pages/client/Settings';
import ClientCompliance from './pages/client/Compliance';

// Simple placeholder pages
const Profile: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-foreground">Profile</h1>
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">User Profile</h2>
        <p className="card-description">Manage your account information</p>
      </div>
      <div className="card-content">
        <p className="text-muted-foreground">Profile management interface coming soon...</p>
      </div>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Account Settings</h2>
        <p className="card-description">Configure your account preferences</p>
      </div>
      <div className="card-content">
        <p className="text-muted-foreground">Settings interface coming soon...</p>
      </div>
    </div>
  </div>
);

/**
 * Auth guard component with real authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Main App component with routing
 */
const App: React.FC = () => {
  // Auto-login for development testing
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      authService.mockLogin('CLIENT_ADMIN');
    }
  }, []);

  return (
    <ThemeProvider defaultMode="system">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Client Portal Routes */}
          <Route
            path="/client/*"
            element={
              <ProtectedRoute>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="team" element={<ClientTeam />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="compliance" element={<ClientCompliance />} />
            <Route index element={<Navigate to="/client/dashboard" replace />} />
          </Route>
          
          {/* End User Portal Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
