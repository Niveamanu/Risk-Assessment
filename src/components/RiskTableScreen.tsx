import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInfo, FiMoreHorizontal, FiMaximize2, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './DashboardRiskTable.css';
import './RiskTableScreen.css';
import DashboardService, { RiskTableData, RiskTableFilterValues } from '../services/dashboardService';
import { dashboardStats } from '../mockData';
import { tokenStorage } from '../authConfig';
import useMsalUser from '../hooks/useMsalUser';

// Fallback data from mockData
const fallbackData = dashboardStats.riskTableData;

const RiskTableScreen: React.FC = () => {
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudies, setTotalStudies] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter values from server
  const [filterValues, setFilterValues] = useState<RiskTableFilterValues>({
    sites: [],
    sponsors: [],
    protocols: []
  });
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Fetch filter values from server
  const fetchFilterValues = async () => {
    try {
      setLoadingFilters(true);
      const response = await DashboardService.getRiskTableFilterValues();
      setFilterValues(response);
    } catch (err: any) {
      console.error('Error fetching filter values:', err);
      // Fallback to empty arrays
      setFilterValues({ sites: [], sponsors: [], protocols: [] });
    } finally {
      setLoadingFilters(false);
    }
  };

  // Fetch risk table data with pagination
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
      
      // Prepare parameters including pagination
      const params: any = {
        page: currentPage,
        pageSize: pageSize
      };
      
      if (selectedSite) params.site = selectedSite;
      if (selectedSponsor) params.sponsor = selectedSponsor;
      if (selectedProtocol) params.protocol = selectedProtocol;
      
      const response = await DashboardService.getAllAssessedStudies(params);
      setTableData(response.riskTableData);
      setTotalPages(response.totalPages);
      setTotalStudies(response.totalStudies);
      setCurrentPage(response.currentPage);
      setPageSize(response.pageSize);
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

  // Fetch data when component mounts or filters/pagination changes
  useEffect(() => {
    console.log('Risk table screen auth state:', {
      isAuthenticated: userInfo?.isAuthenticated,
      hasUserInfo: !!userInfo,
      token: tokenStorage.getAccessToken() ? 'exists' : 'missing',
      tokenExpired: tokenStorage.isTokenExpired()
    });

    // Only fetch data when user is authenticated
    if (userInfo?.isAuthenticated) {
      fetchFilterValues();
      fetchRiskTableData();
    } else {
      setLoading(false);
      setError('Waiting for authentication...');
    }
  }, [userInfo?.isAuthenticated, selectedSite, selectedSponsor, selectedProtocol, currentPage, pageSize]);

  // Handle navigation to Risk Evaluation
  const handleViewAssessment = (studyData: RiskTableData) => {
    // Navigate to Risk Evaluation with complete study data
    navigate(`/risk-evaluation/${studyData.assessment_id}?studyId=${studyData.study_id}`, {
      state: { study: studyData }
    });
  };

  // Handle back navigation
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedSite('');
    setSelectedSponsor('');
    setSelectedProtocol('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="risk-table-screen">
      <div className="risk-table-screen-header">
        <div className="risk-table-screen-header-left">
          <button 
            className="risk-table-screen-back-btn"
            onClick={handleBackToDashboard}
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          <h1 className="risk-table-screen-title">
            <span className="risk-table-screen-title-icon" role="img" aria-label="table">🗂️</span>
            Assessed Studies by Highest Risk (All Sites)
          </h1>
        </div>
        <div className="risk-table-screen-header-right">
          <span className="risk-table-screen-info"><FiInfo /></span>
          <FiMoreHorizontal />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="risk-table-screen-loading">
          <div className="loading-spinner"></div>
          <span>Loading risk table data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="risk-table-screen-error">
          <span>{error}</span>
          {error.includes('authentication') && retryCount < 3 && (
            <button 
              className="risk-table-screen-retry-btn"
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
                     <div className="risk-table-screen-filters">
             <div className="risk-table-screen-filters-left">
               <select 
                 className="risk-table-screen-filter"
                 value={selectedSite}
                 onChange={(e) => setSelectedSite(e.target.value)}
               >
                 <option value="">All Sites</option>
                 {filterValues.sites.map((site, index) => (
                   <option key={index} value={site}>{site}</option>
                 ))}
               </select>
               <select 
                 className="risk-table-screen-filter"
                 value={selectedSponsor}
                 onChange={(e) => setSelectedSponsor(e.target.value)}
               >
                 <option value="">All Sponsor</option>
                 {filterValues.sponsors.map((sponsor, index) => (
                   <option key={index} value={sponsor}>{sponsor}</option>
                 ))}
               </select>
               <select 
                 className="risk-table-screen-filter"
                 value={selectedProtocol}
                 onChange={(e) => setSelectedProtocol(e.target.value)}
               >
                 <option value="">All Protocol</option>
                 {filterValues.protocols.map((protocol, index) => (
                   <option key={index} value={protocol}>{protocol}</option>
                 ))}
               </select>
             </div>
             <div className="risk-table-screen-filters-right">
               {(selectedSite || selectedSponsor || selectedProtocol) && (
                 <button 
                   className="risk-table-screen-clear-filters"
                   onClick={handleClearFilters}
                 >
                   Clear Filters
                 </button>
               )}
             </div>
           </div>
          
          <div className="risk-table-screen-table-wrapper">
            <div className="risk-table-screen-table-header">
              <span className="risk-table-screen-table-count">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalStudies)} of {totalStudies} records
              </span>
              <div className="risk-table-screen-page-size">
                <label htmlFor="pageSize">Show:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="risk-table-screen-page-size-select"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>per page</span>
              </div>
            </div>
            <table className="risk-table-screen-table">
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
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.site}</td>
                    <td>{row.sponsor}</td>
                    <td>{row.protocol}</td>
                    <td>{row.risk}</td>
                    <td>
                      <button 
                        className="risk-table-screen-link"
                        onClick={() => handleViewAssessment(row)}
                      >
                        View Assessment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="risk-table-screen-pagination">
                <div className="risk-table-screen-pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="risk-table-screen-pagination-controls">
                  <button
                    className="risk-table-screen-pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Previous page"
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`risk-table-screen-pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    className="risk-table-screen-pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RiskTableScreen; 