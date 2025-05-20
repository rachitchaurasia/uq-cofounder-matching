import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './DashboardLayout.css'; // We'll create this
import { useAuth } from '../contexts/AuthContext';


const DashboardLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logoutUser();
    navigate('/login');
  };

  // Determine the base URL for the Django admin.
  // This assumes your Django backend is running on port 8000 during development.
  // For production, this might be different.
  const djangoAdminUrl = process.env.NODE_ENV === 'production'
    ? '/admin/' // In production, Django might serve admin under the same domain
    : 'http://127.0.0.1:8000/admin/';

  // Inspired by ProfileScreen.tsx structure
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-title-container">
          <Link to="/dashboard" className="header-title-link">
             {/* <img src="/path-to-your-logo.png" alt="Logo" className="header-logo" /> */}
            <h1>Analytics Dashboard</h1>
          </Link>
        </div>
        <nav className="dashboard-nav">
          <Link to="/dashboard/analytics">Analytics</Link>
        </nav>
        <div className="header-actions">
          {auth.isAuthenticated && (
            <button onClick={handleLogout} className="logout-button" disabled={auth.isLoading}>
              {auth.isLoading ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </div>
      </header>
      <main className="dashboard-main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Your Company</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
