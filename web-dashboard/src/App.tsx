import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import AnalyticsPage from './components/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Default child route for /dashboard */}
              <Route index element={<Navigate to="analytics" replace />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              {/* Add other dashboard sub-routes here, e.g., */}
              {/* <Route path="users" element={<UsersPage />} /> */}
              {/* <Route path="settings" element={<SettingsPage />} /> */}
            </Route>
          </Route>
          {/* Redirect root path to login or dashboard based on auth status */}
          <Route
            path="/"
            element={
              // This logic could also be part of a component that checks auth
              // For simplicity here, redirecting. AuthProvider will handle initial check.
              <Navigate to="/dashboard/analytics" replace />
            }
          />
           {/* Catch-all for undefined routes - optional */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
