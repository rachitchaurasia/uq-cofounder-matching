import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import './LoginPage.css'; // We'll create this

// Designated Admin Email (should match the one in AuthContext.tsx or be imported from a shared config)
const ADMIN_LOGIN_EMAIL = 'admin@uqcofounder.com'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Client-side check for admin email
    if (email.toLowerCase() !== ADMIN_LOGIN_EMAIL.toLowerCase()) {
      setError('Login restricted to admin users only.');
      return;
    }

    setLoading(true);
    try {
      await auth.loginUser({ email, password });
      // Navigation is handled by AuthProvider/ProtectedRoute or successful login effect
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (auth.isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Admin Dashboard Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || auth.isLoading}
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || auth.isLoading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading || auth.isLoading}>
            {loading || auth.isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
