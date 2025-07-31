import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import Expander from './Expander';
import { FiSearch, FiEye, FiAtSign, FiFileText, FiClipboard, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import './AssessedStudies.css';
import StudiesService, { StudyResponse } from '../services/studiesService';
import AssessmentService from '../services/assessmentService';
import { useUserRoles } from '../hooks/useUserRoles';

// Enhanced interface for assessed studies matching backend response
interface AssessedStudy extends StudyResponse {
  assessment_data?: {
    id: number;
    study_id: number;
    assessment_date: string;
    next_review_date?: string;
    monitoring_schedule: string;
    overall_risk_score: number;
    overall_risk_level: string;
    status: string;
    conducted_by_name: string;
    conducted_by_email: string;
    reviewed_by_name?: string;
    reviewed_by_email?: string;
    approved_by_name?: string;
    approved_by_email?: string;
    rejected_by_name?: string;
    rejected_by_email?: string;
    comments?: string;
    created_at: string;
    updated_at: string;
    risk_dashboard?: {
      id: number;
      assessment_id: number;
      total_risks: number;
      high_risk_count: number;
      medium_risk_count: number;
      low_risk_count: number;
      total_score: number;
      overall_risk_level: string;
      risk_level_criteria: string;
      created_at: string;
      updated_at: string;
    };
    summary_comments?: Array<{
      id: number;
      assessment_id: number;
      comment_type: string;
      comment_text: string;
      created_by_name: string;
      created_by_email: string;
      created_at: string;
    }>;
    approval_data?: {
      id: number;
      assessment_id: number;
      action: string;
      action_by_name: string;
      action_by_email: string;
      reason: string;
      comments: string;
      action_date: string;
    };
  };
}

const AssessedStudies: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssessment, setModalAssessment] = useState<AssessedStudy | null>(null);
  const [reason, setReason] = useState('');
  const [assessments, setAssessments] = useState<AssessedStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const { accounts } = useMsal();

  // Fetch assessed studies from backend
  const fetchAssessedStudies = async () => {
    if (rolesLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine type based on admin status
      const userType = isAdmin ? 'SD' : 'PI';
      
      // Use AssessmentService to get assessed studies
      const data = await AssessmentService.getAssessedStudies(userType);
      console.log('Backend response:', data);
      
      if (data.assessed_studies) {
        setAssessments(data.assessed_studies);
      } else {
        setAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching assessed studies:', err);
      setError('Failed to fetch assessed studies. Please try again.');
      
      // Fallback to sample data for development
      setAssessments([
        {
          id: 1,
          site: 'Flourish San Antonio',
          sponsor: 'CinFina Pharma',
          protocol: 'CIN-110-112',
          studytypetext: 'Pulmonology',
          description: 'Severe and Persistent Asthma',
          status: 'Enrolling',
          phase: '1',
          monitoring_schedule: 'Quarterly review',
          assessment_status: 'Pending Review',
          assessment_data: {
            id: 101,
            study_id: 1,
            assessment_date: '2025-09-10',
            overall_risk_score: 32,
            overall_risk_level: 'High',
            status: 'Pending Review',
            conducted_by_name: 'Dr. Smith',
            conducted_by_email: 'dr.smith@flourish.com',
            reviewed_by_name: 'Dr. Johnson',
            reviewed_by_email: 'dr.johnson@flourish.com',
            created_at: '2025-09-10T10:00:00Z',
            updated_at: '2025-09-11T10:00:00Z',
            summary_comments: [
              {
                id: 1,
                assessment_id: 101,
                comment_type: 'Overall Assessment',
                comment_text: 'Not enough participants to draw valid conclusions. Additional recruitment strategies needed.',
                created_by_name: 'Dr. Smith',
                created_by_email: 'dr.smith@flourish.com',
                created_at: '2025-09-10T10:00:00Z'
              }
            ]
          }
        }
      ] as AssessedStudy[]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssessedStudies();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchAssessedStudies();
  }, [rolesLoading, isAdmin]);

  // Filter assessments based on search
  const filteredAssessments = assessments.filter(assessment =>
    assessment.site.toLowerCase().includes(search.toLowerCase()) ||
    assessment.sponsor.toLowerCase().includes(search.toLowerCase()) ||
    assessment.protocol.toLowerCase().includes(search.toLowerCase()) ||
    assessment.description.toLowerCase().includes(search.toLowerCase()) ||
    assessment.assessment_data?.conducted_by_name.toLowerCase().includes(search.toLowerCase())
  );

  const openReviewModal = (assessment: AssessedStudy) => {
    setModalAssessment(assessment);
    // Get the reason from summary comments or approval data
    const reason = assessment.assessment_data?.summary_comments?.[0]?.comment_text || 
                   assessment.assessment_data?.approval_data?.reason || '';
    setReason(reason);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAssessment(null);
    setReason('');
  };

  const handleApprove = async () => {
    if (!modalAssessment) return;
    
    // Reason is optional for approval, but recommended
    if (!reason.trim()) {
      const confirmed = window.confirm('No comments provided. Do you want to proceed with approval?');
      if (!confirmed) return;
    }
    
    try {
      // Get current user info from MSAL
      const account = accounts[0];
      if (!account) {
        alert('User not authenticated. Please log in again.');
        return;
      }

      // Call the API to approve the assessment
      const result = await AssessmentService.approveAssessment(
        modalAssessment.id, // study_id
        modalAssessment.assessment_data!.id, // assessment_id
        reason || 'Assessment approved',
        reason || undefined,
        {
          name: account.name || account.username,
          email: account.username
        }
      );

      console.log('Assessment approved:', result);
      
      // Update local state with the response from the server
      setAssessments(prev => prev.map(assessment => 
        assessment.id === modalAssessment.id 
          ? {
              ...assessment,
              assessment_data: {
                ...assessment.assessment_data!,
                status: 'Approved',
                approved_by_name: account.name || account.username,
                approved_by_email: account.username,
                updated_at: new Date().toISOString(),
                approval_data: {
                  id: result.approval_data?.id || Math.floor(Math.random() * 1000),
                  assessment_id: modalAssessment.assessment_data!.id,
                  action: 'Approved',
                  action_by_name: result.approval_data?.action_by_name || account.name || account.username,
                  action_by_email: result.approval_data?.action_by_email || account.username,
                  reason: result.approval_data?.reason || reason || 'Assessment approved',
                  comments: result.approval_data?.comments || reason || '',
                  action_date: result.approval_data?.action_date || new Date().toISOString()
                }
              }
            }
          : assessment
      ));
      
      closeModal();
    } catch (error) {
      console.error('Error approving assessment:', error);
      alert('Failed to approve assessment. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!modalAssessment || !reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    try {
      // Get current user info from MSAL
      const account = accounts[0];
      if (!account) {
        alert('User not authenticated. Please log in again.');
        return;
      }

      // Call the API to reject the assessment
      const result = await AssessmentService.rejectAssessment(
        modalAssessment.id, // study_id
        modalAssessment.assessment_data!.id, // assessment_id
        reason,
        reason,
        {
          name: account.name || account.username,
          email: account.username
        }
      );

      console.log('Assessment rejected:', result);
      
      // Update local state with the response from the server
      setAssessments(prev => prev.map(assessment => 
        assessment.id === modalAssessment.id 
          ? {
              ...assessment,
              assessment_data: {
                ...assessment.assessment_data!,
                status: 'Rejected',
                rejected_by_name: account.name || account.username,
                rejected_by_email: account.username,
                updated_at: new Date().toISOString(),
                approval_data: {
                  id: result.approval_data?.id || Math.floor(Math.random() * 1000),
                  assessment_id: modalAssessment.assessment_data!.id,
                  action: 'Rejected',
                  action_by_name: result.approval_data?.action_by_name || account.name || account.username,
                  action_by_email: result.approval_data?.action_by_email || account.username,
                  reason: result.approval_data?.reason || reason,
                  comments: result.approval_data?.comments || reason,
                  action_date: result.approval_data?.action_date || new Date().toISOString()
                }
              }
            }
          : assessment
      ));
      
      closeModal();
    } catch (error) {
      console.error('Error rejecting assessment:', error);
      alert('Failed to reject assessment. Please try again.');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending review': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'in progress': return 'status-in-progress';
      default: return 'status-unknown';
    }
  };

  // Get risk level badge class
  const getRiskLevelBadgeClass = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return 'risk-unknown';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {/* Review Modal */}
      {modalOpen && modalAssessment && (
        <div className="assessed-modal-overlay">
          <div className="assessed-modal">
            <div className="assessed-modal-header">
              <span>Review Assessment</span>
              <span className="assessed-modal-close" onClick={closeModal}>&times;</span>
            </div>
            <div className="assessed-modal-body">
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Site:</span> {modalAssessment.site}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Sponsor:</span> {modalAssessment.sponsor}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Protocol:</span> {modalAssessment.protocol}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Study Status:</span> {modalAssessment.status}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Monitoring Schedule:</span> {modalAssessment.monitoring_schedule}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Total Risk Score:</span> {modalAssessment.assessment_data?.overall_risk_score || 0}
              </div>
              <div className="assessed-modal-info-row">
                <span className="assessed-modal-label">Overall Risk:</span> {modalAssessment.assessment_data?.overall_risk_level || 'Unknown'}
              </div>
              
              {/* Approval Data Section */}
              {modalAssessment.assessment_data?.approval_data && (
                <>
                  <div className="assessed-modal-section-title">Approval Information</div>
                  <div className="assessed-modal-info-row">
                    <span className="assessed-modal-label">Action:</span> {modalAssessment.assessment_data.approval_data.action}
                  </div>
                  <div className="assessed-modal-info-row">
                    <span className="assessed-modal-label">Action By:</span> {modalAssessment.assessment_data.approval_data.action_by_name}
                  </div>
                  <div className="assessed-modal-info-row">
                    <span className="assessed-modal-label">Action Date:</span> {formatDate(modalAssessment.assessment_data.approval_data.action_date)}
                  </div>
                  {/* <div className="assessed-modal-info-row">
                    <span className="assessed-modal-label">Reason:</span> {modalAssessment.assessment_data.approval_data.reason}
                  </div>
                  {modalAssessment.assessment_data.approval_data.comments && (
                    <div className="assessed-modal-info-row">
                      <span className="assessed-modal-label">Comments:</span> {modalAssessment.assessment_data.approval_data.comments}
                    </div>
                  )} */}
                </>
              )}
              
              <div className="assessed-modal-info-row" style={{ marginTop: 16 }}>
                <span className="assessed-modal-label">Comments/Reason:</span>
              </div>
              <textarea
                className="assessed-modal-textarea"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Enter comments or reason for approval/rejection..."
                rows={3}
                style={{ width: '100%', marginTop: 4, resize: 'none', borderRadius: 8, border: '1px solid #ddd', padding: 8 }}
              />
            </div>
            <div className="assessed-modal-footer">
              <button className="assessed-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="assessed-modal-approve" onClick={handleApprove}>Approve</button>
              <button className="assessed-modal-reject" onClick={handleReject}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="assessed-container">
        <Expander title="Assessment List" defaultExpanded>
          {/* Search and Refresh Row */}
          <div className="assessed-search-row">
            <div className="assessed-search-input-wrapper">
              <input
                className="assessed-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Protocol"
              />
              <span className="assessed-search-icon"><FiSearch /></span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="assessed-error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && !refreshing && (
            <div className="assessed-loading">
              <div className="loading-spinner"></div>
              <span>Loading assessed studies...</span>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <div className="assessed-results-count">
              Showing {filteredAssessments.length} of {assessments.length} assessed studies
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="assessed-table-wrapper">
              <table className="assessed-table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Sponsor</th>
                    <th>Protocol</th>
                    <th>Study Type</th>
                    <th>Description</th>
                    <th>Study Status</th>
                    <th>Phase</th>
                    <th>Monitoring Schedule</th>
                    <th>Assessment Date</th>
                    <th>Total Risk Score</th>
                    <th>Overall Risk</th>
                    <th>Assessment Status</th>
                    <th>Reason</th>
                    <th>Last Updated</th>
                    <th>Conducted By</th>
                    <th>Reviewed By</th>
                    <th>Approved By</th>
                    <th>Rejected By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map((assessment, idx) => (
                    <tr key={idx}>
                      <td>{assessment.site}</td>
                      <td>{assessment.sponsor}</td>
                      <td>{assessment.protocol}</td>
                      <td>{assessment.studytypetext}</td>
                      <td>{assessment.description}</td>
                      <td>{assessment.status}</td>
                      <td>{assessment.phase}</td>
                      <td>{assessment.monitoring_schedule}</td>
                      <td>{assessment.assessment_data?.assessment_date || '-'}</td>
                      <td>{assessment.assessment_data?.overall_risk_score || 0}</td>
                      <td>
                        <span className={`risk-badge ${getRiskLevelBadgeClass(assessment.assessment_data?.overall_risk_level || '')}`}>
                          {assessment.assessment_data?.overall_risk_level || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(assessment.assessment_data?.status || '')}`}>
                          {assessment.assessment_data?.status || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        {assessment.assessment_data?.summary_comments?.[0]?.comment_text || 
                         assessment.assessment_data?.approval_data?.reason || '-'}
                      </td>
                      <td>{formatDate(assessment.assessment_data?.updated_at || '')}</td>
                      <td>{assessment.assessment_data?.conducted_by_name || '-'}</td>
                      <td>
                        {assessment.assessment_data?.status === 'Approved' || assessment.assessment_data?.status === 'Rejected'
                          ? assessment.assessment_data?.approval_data?.action_by_name || assessment.assessment_data?.reviewed_by_name || '-'
                          : assessment.assessment_data?.reviewed_by_name || '-'}
                      </td>
                      <td>
                        {assessment.assessment_data?.status === 'Approved'
                          ? assessment.assessment_data?.approval_data?.action_by_name || assessment.assessment_data?.approved_by_name || '-'
                          : '-'}
                      </td>
                      <td>
                        {assessment.assessment_data?.status === 'Rejected'
                          ? assessment.assessment_data?.approval_data?.action_by_name || assessment.assessment_data?.rejected_by_name || '-'
                          : '-'}
                      </td>
                      <td className="assessed-actions">
                        <button 
                          className="assessed-action-btn" 
                          onClick={() => navigate('/risk-evaluation', { state: { study: assessment } })}
                          title="View/Edit Assessment"
                        >
                          <FiEye /> View
                        </button>
                        <button 
                          className="assessed-action-btn" 
                          onClick={() => navigate('/assessment-audit', { state: { study: assessment } })}
                          title="View Assessment Audit"
                        >
                          <FiAtSign /> Audit
                        </button>
                        <button 
                          className="assessed-action-btn" 
                          onClick={() => navigate('/assessment-timeline', { state: { study: assessment } })}
                          title="View Assessment Timeline"
                        >
                          <FiFileText /> Timeline
                        </button>
                        {isAdmin && (
                          <button 
                            className="assessed-action-btn" 
                            onClick={() => openReviewModal(assessment)}
                            title="Review Assessment"
                          >
                            <FiClipboard /> Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredAssessments.length === 0 && (
            <div className="assessed-no-results">
              <p>No assessed studies found matching your search criteria.</p>
              <button onClick={() => setSearch('')}>Clear Search</button>
            </div>
          )}
        </Expander>
      </div>
    </>
  );
};

export default AssessedStudies; 