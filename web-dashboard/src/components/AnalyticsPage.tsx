import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Assuming you might use auth for fetch headers
import './AnalyticsPage.css'; // We'll create this

interface AnalyticsData {
  total_users: number;
  new_users_last_7_days: number;
  average_profile_completion: number;
  fully_completed_profiles: number;
  total_profiles_with_data: number;
  users_by_region: Array<{ region: string; count: number }>;
  users_by_role: Array<{ role: string; count: number }>;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get auth state

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) { // Don't fetch if not authenticated
        setLoading(false);
        setError("User not authenticated. Cannot fetch analytics.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // The getCookie function should be available globally or imported if it's in AuthContext
        // For simplicity, assuming direct availability or that AuthContext handles tokens for fetch
        // const csrfToken = getCookie('csrftoken'); // Not typically needed for GET if session auth is working

        const response = await fetch('/matchingapp/api/analytics/dashboard/'); // Ensure this path is correct based on Django urls
        if (!response.ok) {
          if (response.status === 403) {
             throw new Error('Access Forbidden: You might not have permission to view analytics.');
          }
          throw new Error(`Failed to fetch analytics data. Status: ${response.status}`);
        }
        const result: AnalyticsData = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching analytics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]); // Re-fetch if authentication state changes

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header"><h2>Analytics Overview</h2></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-header"><h2>Analytics Overview</h2></div>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-page">
        <div className="page-header"><h2>Analytics Overview</h2></div>
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Analytics Overview</h2>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{data.total_users}</p>
        </div>
        <div className="stat-card">
          <h3>New Users (Last 7 Days)</h3>
          <p className="stat-value">{data.new_users_last_7_days}</p>
        </div>
        <div className="stat-card">
          <h3>Avg. Profile Completion</h3>
          <p className="stat-value">{data.average_profile_completion}%</p>
          <p className="stat-detail">({data.fully_completed_profiles} / {data.total_profiles_with_data} fully completed)</p>
        </div>
         <div className="stat-card">
          <h3>Profiles with Data</h3>
          <p className="stat-value">{data.total_profiles_with_data}</p>
        </div>
      </div>

      <div className="charts-container"> {/* Using this class for consistency, even if not charts yet */}
        <div className="data-table-container chart-card"> {/* Re-using chart-card style for sections */}
          <h4>Users by Region (Top 5)</h4>
          {data.users_by_region && data.users_by_region.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>User Count</th>
                </tr>
              </thead>
              <tbody>
                {data.users_by_region.map((item, index) => (
                  <tr key={index}>
                    <td>{item.region}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No region data available.</p>
          )}
        </div>

        <div className="data-table-container chart-card">
          <h4>Users by Role (Top 5)</h4>
           {data.users_by_role && data.users_by_role.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>User Count</th>
                </tr>
              </thead>
              <tbody>
                {data.users_by_role.map((item, index) => (
                  <tr key={index}>
                    <td>{item.role}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No role data available.</p>
          )}
        </div>
      </div>
      
      {/* Placeholder for more advanced charts later */}
      {/* <div className="charts-container">
        <div className="chart-card">
          <h4>User Activity Over Time</h4>
          <div className="chart-placeholder">Chart will go here</div>
        </div>
      </div> */}
    </div>
  );
};

export default AnalyticsPage;
