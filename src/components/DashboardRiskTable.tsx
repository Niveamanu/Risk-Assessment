import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInfo, FiMoreHorizontal, FiMaximize2 } from 'react-icons/fi';
import './DashboardRiskTable.css';
import DashboardService, { RiskTableData, AssessedStudiesHighestRisk } from '../services/dashboardService';
import { dashboardStats } from '../mockData';
import { tokenStorage } from '../authConfig';
import useMsalUser from '../hooks/useMsalUser';

// Fallback data from mockData
const fallbackData = dashboardStats.riskTableData;

const DashboardRiskTable: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useMsalUser();
  const [tableData, setTableData] = useState<RiskTableData[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Filter states
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  
  // Get distinct values from the first 10 records for filters
  const getDistinctValues = (data: RiskTableData[], limit: number = 10) => {
    const limitedData = data.slice(0, limit);
    const sites = [...new Set(limitedData.map(item => item.site))].sort();
    const sponsors = [...new Set(limitedData.map(item => item.sponsor))].sort();
    const protocols = [...new Set(limitedData.map(item => item.protocol))].sort();
    
    return { sites, sponsors, protocols };
  };
  
  const { sites, sponsors, protocols } = getDistinctValues(tableData);

  // Fetch risk table data
  useEffect(() => {
    console.log('Risk table auth state:', {
      isAuthenticated: userInfo?.isAuthenticated,
      hasUserInfo: !!userInfo,
      token: tokenStorage.getAccessToken() ? 'exists' : 'missing',
      tokenExpired: tokenStorage.isTokenExpired()
    });

    const fetchRiskTableData = async () => {
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
        
        // Prepare filter parameters
        const filterParams: any = {};
        if (selectedSite) filterParams.site = selectedSite;
        if (selectedSponsor) filterParams.sponsor = selectedSponsor;
        if (selectedProtocol) filterParams.protocol = selectedProtocol;
        
        const response = await DashboardService.getAssessedStudiesHighestRisk(filterParams);
        setTableData(response.riskTableData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching risk table data:', err);
        
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('Authentication required. Please refresh the page.');
        } else if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to load risk table data');
        }
        
        // Keep fallback data
        setTableData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when user is authenticated
    if (userInfo?.isAuthenticated) {
      fetchRiskTableData();
    } else {
      setLoading(false);
      setError('Waiting for authentication...');
    }
  }, [userInfo?.isAuthenticated, selectedSite, selectedSponsor, selectedProtocol]);

  // Handle navigation to Risk Evaluation
  const handleViewAssessment = (studyData: RiskTableData) => {
    // Navigate to Risk Evaluation with complete study data
    navigate(`/risk-evaluation/${studyData.assessment_id}?studyId=${studyData.study_id}`, {
      state: { study: studyData }
    });
  };

  // Handle navigation to full risk table screen
  const handleShowAll = () => {
    navigate('/risk-table');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedSite('');
    setSelectedSponsor('');
    setSelectedProtocol('');
  };

  return (
    <div className="dashboard-riskcard">
      <div className="dashboard-riskcard-header">
        <span className="dashboard-riskcard-title">
          <span className="dashboard-riskcard-title-icon" role="img" aria-label="table">🗂️</span>
          Assessed Studies by Highest Risk (All Sites)
          <span className="dashboard-riskcard-info"><FiInfo /></span>
        </span>
        <span className="dashboard-riskcard-actions">
          <FiMaximize2 style={{ marginRight: 8 }} />
          <FiMoreHorizontal />
        </span>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="dashboard-riskcard-loading">
          <div className="loading-spinner"></div>
          <span>Loading risk table data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="dashboard-riskcard-error">
          <span>{error}</span>
          {error.includes('authentication') && retryCount < 3 && (
            <button 
              className="dashboard-riskcard-retry-btn"
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

      {/* Table Content */}
      {!loading && !error && (
        <>
                     <div className="dashboard-riskcard-filters">
             <div className="dashboard-riskcard-filters-left">
               <select 
                 className="dashboard-riskcard-filter"
                 value={selectedSite}
                 onChange={(e) => setSelectedSite(e.target.value)}
               >
                 <option value="">All Sites</option>
                 {sites.map((site, index) => (
                   <option key={index} value={site}>{site}</option>
                 ))}
               </select>
               <select 
                 className="dashboard-riskcard-filter"
                 value={selectedSponsor}
                 onChange={(e) => setSelectedSponsor(e.target.value)}
               >
                 <option value="">All Sponsor</option>
                 {sponsors.map((sponsor, index) => (
                   <option key={index} value={sponsor}>{sponsor}</option>
                 ))}
               </select>
               <select 
                 className="dashboard-riskcard-filter"
                 value={selectedProtocol}
                 onChange={(e) => setSelectedProtocol(e.target.value)}
               >
                 <option value="">All Protocol</option>
                 {protocols.map((protocol, index) => (
                   <option key={index} value={protocol}>{protocol}</option>
                 ))}
               </select>
             </div>
             <div className="dashboard-riskcard-filters-right">
               {(selectedSite || selectedSponsor || selectedProtocol) && (
                 <button 
                   className="dashboard-riskcard-clear-filters"
                   onClick={handleClearFilters}
                 >
                   Clear Filters
                 </button>
               )}
             </div>
           </div>
          <div className="dashboard-riskcard-table-wrapper">
            <table className="dashboard-riskcard-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Sponsor</th>
                  <th>Protocol</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.site}</td>
                    <td>{row.sponsor}</td>
                    <td>{row.protocol}</td>
                    <td>{row.risk}</td>
                    <td>
                                             <button 
                         className="dashboard-riskcard-link"
                         onClick={() => handleViewAssessment(row)}
                       >
                         View Assessment
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                         <div className="dashboard-riskcard-showall">
               <span className="dashboard-riskcard-showall-text">
                 Showing top 10 of {tableData.length} records (limited view)
               </span>
               <button onClick={handleShowAll} className="dashboard-riskcard-showall-btn">
                 Show all
               </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardRiskTable; 