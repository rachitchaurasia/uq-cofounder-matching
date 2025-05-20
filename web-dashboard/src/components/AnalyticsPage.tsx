import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Assuming you might use auth for fetch headers
import { supabase } from '../supabaseClient'; // Import Supabase client
import './AnalyticsPage.css'; // We'll create this
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserTrendDataPoint {
  date: string;
  count: number;
}

interface AnalyticsData {
  total_users: number;
  new_users_last_7_days: number;
  average_profile_completion: number;
  fully_completed_profiles: number;
  total_profiles_with_data: number;
  users_by_region: Array<{ region: string | null; count: number }>;
  users_by_role: Array<{ role: string | null; count: number }>;
  user_signups_trend: UserTrendDataPoint[];
  accountAgeDistribution: Array<{ range: string; count: number }>;
}

interface ProfileForAnalytics {
  region: string | null;
  role: string | null;
  created_at: string; // Added for sign-ups trend
}

// Define available views
type AnalyticsView = 'overview' | 'userTrends' | 'profileInsights';

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Removed 'user' as it's not directly used here yet
  const [activeView, setActiveView] = useState<AnalyticsView>('overview'); // State for active view

  const fetchAnalyticsData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("User not authenticated. Cannot fetch analytics.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { count: totalUsersCount, error: totalUsersError } = await supabase
        .from('profiles')
        .select('*' , { count: 'exact', head: true });

      if (totalUsersError) throw new Error(`Failed to fetch total users: ${totalUsersError.message}`);

      const sevenDaysAgoISO = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
      
      const { count: newUsersCount, error: newUsersError } = await supabase
        .from('profiles')
        .select('*' , { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoISO);

      if (newUsersError) throw new Error(`Failed to fetch new users: ${newUsersError.message}`);

      // Fetch all profiles for region and role analytics
      // Select only necessary columns to optimize
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles') // Remove explicit generic, let TypeScript infer
        .select('region, role, created_at'); 

      if (profilesError) throw new Error(`Failed to fetch profiles for analytics: ${profilesError.message}`);

      let usersByRegionMap: Map<string | null, number> = new Map();
      let usersByRoleMap: Map<string | null, number> = new Map();
      let dailySignupsMap: Map<string, number> = new Map();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // For Account Age Distribution
      const accountAgeBuckets = {
        "0-30 days": 0,
        "31-90 days": 0,
        "91-180 days": 0,
        "181+ days": 0,
      };
      const now = new Date();
      const d30 = new Date(now);
      d30.setDate(now.getDate() - 30);
      const d90 = new Date(now);
      d90.setDate(now.getDate() - 90);
      const d180 = new Date(now);
      d180.setDate(now.getDate() - 180);

      if (allProfiles) {
        for (const profile of allProfiles) {
          // Region count
          const region = profile.region || 'N/A'; // Handle null/empty regions
          usersByRegionMap.set(region, (usersByRegionMap.get(region) || 0) + 1);

          // Role count
          const role = profile.role || 'N/A'; // Handle null/empty roles
          usersByRoleMap.set(role, (usersByRoleMap.get(role) || 0) + 1);

          if (profile.created_at) {
            const signupDate = new Date(profile.created_at);
            if (signupDate >= thirtyDaysAgo) {
              const dateString = signupDate.toISOString().split('T')[0]; // YYYY-MM-DD
              dailySignupsMap.set(dateString, (dailySignupsMap.get(dateString) || 0) + 1);
            }

            // Calculate account age
            if (profile.created_at) {
                const createdAtDate = new Date(profile.created_at);
                if (createdAtDate > d30) {
                    accountAgeBuckets["0-30 days"]++;
                } else if (createdAtDate > d90) {
                    accountAgeBuckets["31-90 days"]++;
                } else if (createdAtDate > d180) {
                    accountAgeBuckets["91-180 days"]++;
                } else {
                    accountAgeBuckets["181+ days"]++;
                }
            }
          }
        }
      }
      
      const usersByRegion = Array.from(usersByRegionMap, ([region, count]) => ({ region, count }))
                                 .sort((a, b) => b.count - a.count);
      const usersByRole = Array.from(usersByRoleMap, ([role, count]) => ({ role, count }))
                               .sort((a, b) => b.count - a.count);

      const userSignupsTrend: UserTrendDataPoint[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        userSignupsTrend.push({ date: dateString, count: dailySignupsMap.get(dateString) || 0 });
      }
      userSignupsTrend.reverse(); // Show oldest to newest

      const accountAgeDistributionData = Object.entries(accountAgeBuckets).map(([range, count]) => ({ range, count }));

      const placeholderAnalytics: Partial<AnalyticsData> = {
        average_profile_completion: 0,
        fully_completed_profiles: 0,
        total_profiles_with_data: totalUsersCount || 0, 
      };

      setData({
        total_users: totalUsersCount || 0,
        new_users_last_7_days: newUsersCount || 0,
        users_by_region: usersByRegion,
        users_by_role: usersByRole,
        user_signups_trend: userSignupsTrend,
        accountAgeDistribution: accountAgeDistributionData,
        ...placeholderAnalytics,
      } as AnalyticsData);

    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching analytics.');
      console.error("Fetch Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Chart options
  const commonChartOptions = (titleText: string) => ({
    responsive: true,
    plugins: {
      legend: { display: false }, // Often legend is not needed for simple bar charts
      title: { display: true, text: titleText },
    },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, // Ensure integer ticks for counts
  });

  const lineChartData = {
    labels: data?.user_signups_trend.map(d => d.date) || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.user_signups_trend.map(d => d.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const usersByRoleChartData = {
    labels: data?.users_by_role.slice(0, 10).map(item => item.role || 'N/A') || [], // Top 10 roles
    datasets: [
      {
        label: 'User Count',
        data: data?.users_by_role.slice(0, 10).map(item => item.count) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const usersByRegionChartData = {
    labels: data?.users_by_region.slice(0, 10).map(item => item.region || 'N/A') || [], // Top 10 regions
    datasets: [
      {
        label: 'User Count',
        data: data?.users_by_region.slice(0, 10).map(item => item.count) || [],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const accountAgeChartData = {
    labels: data?.accountAgeDistribution?.map(item => item.range) || [],
    datasets: [
      {
        label: 'Number of Users',
        data: data?.accountAgeDistribution?.map(item => item.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

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
      <div className="analytics-nav-buttons">
        <button onClick={() => setActiveView('overview')} className={activeView === 'overview' ? 'active' : ''}>Overview Stats</button>
        <button onClick={() => setActiveView('userTrends')} className={activeView === 'userTrends' ? 'active' : ''}>User Trends</button>
        <button onClick={() => setActiveView('profileInsights')} className={activeView === 'profileInsights' ? 'active' : ''}>Profile Insights</button>
      </div>

      {activeView === 'overview' && (
        <>
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
                    {data.users_by_region.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td>{item.region || 'N/A'}</td>
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
                    {data.users_by_role.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td>{item.role || 'N/A'}</td>
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
        </>
      )}

      {activeView === 'userTrends' && (
        <div className="charts-container">
          <div className="chart-card">
            <Line options={commonChartOptions('User Sign-ups (Last 30 Days)')} data={lineChartData} />
          </div>
          <div className="chart-card">
            <Bar options={commonChartOptions('Users by Role (Top 10)')} data={usersByRoleChartData} />
          </div>
          <div className="chart-card">
            <Bar options={commonChartOptions('Users by Region (Top 10)')} data={usersByRegionChartData} />
          </div>
        </div>
      )}
      
      {activeView === 'profileInsights' && (
        <>
          <div className="stats-container profile-insights-stats">
             <div className="stat-card">
              <h3>Average Profile Completion</h3>
              <p className="stat-value">{data.average_profile_completion}%</p>
              <small>(Placeholder)</small>
            </div>
            <div className="stat-card">
              <h3>Fully Completed Profiles</h3>
              <p className="stat-value">{data.fully_completed_profiles}</p>
              <small>(Placeholder)</small>
            </div>
             <div className="stat-card">
              <h3>Profiles with Any Data</h3>
              <p className="stat-value">{data.total_profiles_with_data}</p>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <Bar options={commonChartOptions('Account Age Distribution')} data={accountAgeChartData} />
            </div>
          </div>
          
          <div className="profile-insights-discussion">
            <h4>Further Profile Insights</h4>
            <p>
              We can add more detailed insights here based on your specific profile fields. 
              For example, we could track:
            </p>
            <ul>
              <li>Completion rates for fields like 'bio', 'skills', 'project interests', 'portfolio URL'.</li>
              <li>Most common skills or interests listed by users.</li>
              <li>Distribution of user-defined experience levels.</li>
            </ul>
            <p>
              Please let me know which profile attributes are most important for you to analyze!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
