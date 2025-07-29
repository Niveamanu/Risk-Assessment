import React, { useState, useEffect } from 'react';
import { FiInfo, FiMoreHorizontal, FiMaximize2 } from 'react-icons/fi';
import './DashboardBarChart.css';
import DashboardService, { TopStudiesRiskChart, BarChartData } from '../services/dashboardService';
import { dashboardStats } from '../mockData';
import { tokenStorage } from '../authConfig';
import useMsalUser from '../hooks/useMsalUser';

// Fallback data from mockData
const fallbackData = dashboardStats.barChartData;

const DashboardBarChart: React.FC = () => {
  const userInfo = useMsalUser();
  const [chartData, setChartData] = useState<BarChartData[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.map(item => item.value), 60);

  // Fetch bar chart data
  useEffect(() => {
    console.log('Bar chart auth state:', {
      isAuthenticated: userInfo?.isAuthenticated,
      hasUserInfo: !!userInfo,
      token: tokenStorage.getAccessToken() ? 'exists' : 'missing',
      tokenExpired: tokenStorage.isTokenExpired()
    });

    const fetchBarChartData = async () => {
      try {
        setLoading(true);
        
        // Check if we have a valid token before making the API call
        const token = tokenStorage.getAccessToken();
        if (!token || tokenStorage.isTokenExpired()) {
          console.log('No valid token available, waiting for authentication...');
          setError('Waiting for authentication...');
          setLoading(false);
          return;
        }
        
        const response = await DashboardService.getTopStudiesRiskChart();
        setChartData(response.barChartData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching bar chart data:', err);
        
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('Authentication required. Please refresh the page.');
        } else if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to load chart data');
        }
        
        // Keep fallback data
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when user is authenticated
    if (userInfo?.isAuthenticated) {
      fetchBarChartData();
    } else {
      setLoading(false);
      setError('Waiting for authentication...');
    }
  }, [userInfo?.isAuthenticated]);

  return (
    <div className="dashboard-barcard">
      <div className="dashboard-barcard-header">
        <span className="dashboard-barcard-title">
          <span className="dashboard-barcard-title-icon">🟥</span>
          Top 10 Site Studies By Risk Score (All Sites)
          <span className="dashboard-barcard-info"><FiInfo /></span>
        </span>
        <span className="dashboard-barcard-actions">
          <FiMaximize2 style={{ marginRight: 8 }} />
          <FiMoreHorizontal />
        </span>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="dashboard-barcard-loading">
          <div className="loading-spinner"></div>
          <span>Loading chart data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="dashboard-barcard-error">
          <span>{error}</span>
          {error.includes('authentication') && retryCount < 3 && (
            <button 
              className="dashboard-barcard-retry-btn"
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

      {/* Chart Content */}
      {!loading && !error && (
        <div className="dashboard-barcard-chart">
          {chartData.map((row, idx) => (
            <div className="dashboard-barcard-row" key={idx}>
              <span 
                className="dashboard-barcard-label" 
                title={row.label}
              >
                {row.label}
              </span>
              <div className="dashboard-barcard-bar-bg">
                <div
                  className="dashboard-barcard-bar"
                  style={{ width: `${(row.value / maxValue) * 100}%`, background: row.color }}
                >
                  {/* Risk Score Label on Bar */}
                  <span className="dashboard-barcard-bar-label">
                    {row.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="dashboard-barcard-xaxis">
            {[0, Math.round(maxValue * 0.2), Math.round(maxValue * 0.4), Math.round(maxValue * 0.6), Math.round(maxValue * 0.8), maxValue].map((tick) => (
              <span key={tick} className="dashboard-barcard-xaxis-tick">{tick}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBarChart; 