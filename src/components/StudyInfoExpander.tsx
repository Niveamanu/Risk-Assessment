import React from 'react';
import Expander from './Expander';
import { FiDownload } from 'react-icons/fi';

interface StudyInfoExpanderProps {
  study: any;
}

const StudyInfoExpander: React.FC<StudyInfoExpanderProps> = ({ study }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending review': return 'status-pending';
      case 'initial save': return 'status-draft';
      default: return 'status-unknown';
    }
  };

  const getRiskLevelBadgeClass = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return 'risk-unknown';
    }
  };

  return (
    <Expander title="Study Information" defaultExpanded>
      {study ? (
        <div style={{ padding: '12px 0' }}>
          {/* Compact Study Info Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '8px 16px',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {/* Basic Study Info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Site:</span>
              <span style={{ marginLeft: '8px' }}>{study.site}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Sponsor:</span>
              <span style={{ marginLeft: '8px' }}>{study.sponsor}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Protocol:</span>
              <span style={{ marginLeft: '8px' }}>{study.protocol}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Type:</span>
              <span style={{ marginLeft: '8px' }}>{study.studytypetext || study.studyType}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Status:</span>
              <span style={{ marginLeft: '8px' }}>{study.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Phase:</span>
              <span style={{ marginLeft: '8px' }}>{study.phase}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Schedule:</span>
              <span style={{ marginLeft: '8px' }}>{study.monitoring_schedule || study.monitoring || '-'}</span>
            </div>
            
            {/* Assessment Info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Assessment:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.assessment_date ? formatDate(study.assessment_data.assessment_date) : (study.assessmentDate || '-')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Next Review:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.next_review_date ? formatDate(study.assessment_data.next_review_date) : (study.nextReviewDate || '-')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Status:</span>
              <span style={{ marginLeft: '8px' }}>
                <span className={`status-badge ${getStatusBadgeClass(study.assessment_data?.status || study.assessmentStatus)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {study.assessment_data?.status || study.assessmentStatus || 'Unknown'}
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Risk Score:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.overall_risk_score || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Risk Level:</span>
              <span style={{ marginLeft: '8px' }}>
                <span className={`risk-badge ${getRiskLevelBadgeClass(study.assessment_data?.overall_risk_level)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {study.assessment_data?.overall_risk_level || 'Unknown'}
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Conducted By:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.conducted_by_name || study.conductedBy || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Reviewed By:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.reviewed_by_name || study.reviewedBy || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Approved By:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.approved_by_name || study.approvedBy || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#666', minWidth: '80px' }}>Rejected By:</span>
              <span style={{ marginLeft: '8px' }}>{study.assessment_data?.rejected_by_name || study.rejectedBy || '-'}</span>
            </div>
          </div>

          {/* Description - Full Width */}
          <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: '500', color: '#666', marginBottom: '4px', fontSize: '13px' }}>Description:</div>
            <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#333' }}>{study.description}</div>
          </div>

          {/* Approval Info - If Available */}
          {study.assessment_data?.approval_data && (
            <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: '500', color: '#666', marginBottom: '4px', fontSize: '13px' }}>Approval:</div>
              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                <strong>{study.assessment_data.approval_data.action}</strong> by {study.assessment_data.approval_data.action_by_name} on {formatDate(study.assessment_data.approval_data.action_date)}
                {study.assessment_data.approval_data.reason && (
                  <div style={{ marginTop: '4px', color: '#666' }}>Reason: {study.assessment_data.approval_data.reason}</div>
                )}
              </div>
            </div>
          )}

          {/* Summary Comments - If Available */}
          {study.assessment_data?.summary_comments && study.assessment_data.summary_comments.length > 0 && (
            <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: '500', color: '#666', marginBottom: '4px', fontSize: '13px' }}>Comments:</div>
              {study.assessment_data.summary_comments.map((comment: any, index: number) => (
                <div key={index} style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '4px' }}>
                  <strong>{comment.comment_type}:</strong> {comment.comment_text}
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    By {comment.created_by_name} on {formatDate(comment.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Download Button */}
          <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e9ecef', textAlign: 'right' }}>
            <button className="riskeval-download-btn" type="button" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Download Assessment <span className="riskeval-download-icon"><FiDownload /></span>
            </button>
          </div>
        </div>
      ) : (
        <div className="riskeval-no-data">No study selected.</div>
      )}
    </Expander>
  );
};

export default StudyInfoExpander; 