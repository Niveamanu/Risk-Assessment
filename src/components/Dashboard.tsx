import React, { useState, useEffect } from 'react';
import { FiDatabase, FiLayers, FiClipboard, FiFileText, FiXCircle, FiClock } from 'react-icons/fi';
import './Dashboard.css';
import useMsalUser from '../hooks/useMsalUser';
import { useUserRoles } from '../hooks/useUserRoles';
import DashboardBarChart from './DashboardBarChart';
import DashboardRiskTable from './DashboardRiskTable';
import DashboardService, { DashboardStats } from '../services/dashboardService';
import { tokenStorage } from '../authConfig';

const icons = [<FiDatabase />, <FiLayers />, <FiClipboard />, <FiFileText />, <FiXCircle />, <FiClock />];

const Dashboard: React.FC = () => {
  const userInfo = useMsalUser();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshingForRole, setRefreshingForRole] = useState(false);

  const userName = userInfo?.name || 'User';

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have a valid token before making the API call
      const token = tokenStorage.getAccessToken();
      if (!token || tokenStorage.isTokenExpired()) {
        console.log('No valid token available, waiting for authentication...');
        setError('Waiting for authentication...');
        setLoading(false);
        return;
      }
      
      // Use actual role if available, otherwise use default
      const userType = isAdmin ? 'SD' : 'PI';
      console.log('Fetching dashboard stats with user type:', userType, 'rolesLoading:', rolesLoading, 'isAdmin:', isAdmin);
      
      const stats = await DashboardService.getDashboardStats(userType);
      setDashboardStats(stats);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError('Authentication required. Please refresh the page.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load dashboard statistics. Please try again.');
      }
      
      // Fallback to default values if API fails
      setDashboardStats({
        total_active_sites: 0,
        total_active_studies: 0,
        total_assessed_studies: 0,
        total_approved_assessments: 0,
        total_rejected_assessments: 0,
        total_reviews_pending: 0,
        user_type: isAdmin ? 'SD' : 'PI',
        user_email: userInfo?.email || ''
      });
    } finally {
      setLoading(false);
      setRefreshingForRole(false);
    }
  };

  // Load dashboard stats when component mounts or user role changes
  useEffect(() => {
    console.log('Dashboard auth state:', {
      isAuthenticated: userInfo?.isAuthenticated,
      rolesLoading,
      isAdmin,
      hasUserInfo: !!userInfo,
      token: tokenStorage.getAccessToken() ? 'exists' : 'missing',
      tokenExpired: tokenStorage.isTokenExpired()
    });

    // Only fetch data when user is authenticated (don't wait for roles)
    if (userInfo?.isAuthenticated) {
      fetchDashboardStats();
    } else if (!userInfo?.isAuthenticated) {
      setLoading(false);
      setError('Waiting for authentication...');
    }
  }, [userInfo?.isAuthenticated, isAdmin]);

  // Refresh dashboard stats when roles are loaded (if we initially used default user type)
  useEffect(() => {
    if (userInfo?.isAuthenticated && !rolesLoading && dashboardStats && !refreshingForRole) {
      const currentUserType = dashboardStats.user_type;
      const actualUserType = isAdmin ? 'SD' : 'PI';
      
      // If the user type changed after roles loaded, refresh the stats
      if (currentUserType !== actualUserType) {
        console.log('User role changed, refreshing dashboard stats:', currentUserType, '->', actualUserType);
        setRefreshingForRole(true);
        fetchDashboardStats();
      }
    }
  }, [rolesLoading, isAdmin, userInfo?.isAuthenticated, dashboardStats]);

  // Create cards from dashboard stats
  const createCards = (stats: DashboardStats) => [
    { 
      label: 'Total Active Sites', 
      count: stats.total_active_sites, 
      color: '#a99cff',
      icon: icons[0]
    },
    { 
      label: 'Total Active Studies', 
      count: stats.total_active_studies, 
      color: '#ffd966',
      icon: icons[1]
    },
    { 
      label: 'Total Assessed Studies', 
      count: stats.total_assessed_studies, 
      color: '#b6f5d8',
      icon: icons[2]
    },
    { 
      label: 'Total Approved Assessments', 
      count: stats.total_approved_assessments, 
      color: '#b6e0fc',
      icon: icons[3]
    },
    { 
      label: 'Total Rejected Assessments', 
      count: stats.total_rejected_assessments, 
      color: '#ffd6b6',
      icon: icons[4]
    },
    { 
      label: 'Total Reviews Pending', 
      count: stats.total_reviews_pending, 
      color: '#b6c7f5',
      icon: icons[5]
    },
  ];

  const cards = dashboardStats ? createCards(dashboardStats) : [];

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <span className="dashboard-welcome">Welcome Back <span role="img" aria-label="wave">👋🏻</span></span>
        <span className="dashboard-user">{userName}</span>
      </div>
      <div className="dashboard-subheader">Here's the overview</div>
      
      {/* Error Message */}
      {error && (
        <div className="dashboard-error-message">
          <span>{error}</span>
          {error.includes('authentication') && retryCount < 3 && (
            <button 
              className="dashboard-retry-btn"
              onClick={() => {
                setRetryCount(prev => prev + 1);
                setError(null);
                setLoading(true);
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <span>
            {refreshingForRole 
              ? 'Updating dashboard for your role...' 
              : 'Loading dashboard statistics...'
            }
          </span>
        </div>
      )}

      {/* User-Specific Statistics Section */}
      {!loading && (
        <>
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <span className="dashboard-section-icon">👤</span>
              <span>Your Statistics</span>
            </div>
            <div className="dashboard-section-subtitle">
              Data specific to your role ({isAdmin ? 'Study Director' : 'Principal Investigator'})
            </div>
          </div>
          
          <div className="dashboard-card-grid">
            {cards.map((card, idx) => (
              <div className="dashboard-card" key={idx}>
                <div className="dashboard-card-icon" style={{ background: card.color }}>{card.icon}</div>
                <div className="dashboard-card-content">
                  <div className="dashboard-card-count">{card.count.toString().padStart(2, '0')}</div>
                  <div className="dashboard-card-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Site-Wide Statistics Section */}
      <div className="dashboard-section-header">
        <div className="dashboard-section-title">
          <span className="dashboard-section-icon">🏥</span>
          <span>Site-Wide Overview</span>
        </div>
        <div className="dashboard-section-subtitle">
          Data across all sites and studies
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom-grid">
        <div className="dashboard-bottom-left">
          <DashboardBarChart />
        </div>
        <div className="dashboard-bottom-right">
          <DashboardRiskTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 