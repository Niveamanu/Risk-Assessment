import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudyInfoExpander from './StudyInfoExpander';
import Expander from './Expander';
import AssessmentService from '../services/assessmentService';
import './RiskEvaluation.css';

interface AuditData {
  timestamp: string;
  riskFactor: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
}

const AssessmentAudit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const study = location.state?.study;

  const [auditData, setAuditData] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (study?.id) {
      fetchAuditData();
    }
  }, [study?.id]);

  const fetchAuditData = async () => {
    if (!study?.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await AssessmentService.getAssessmentAudit(study.id);

      if (result.success) {
        setAuditData(result.audit_data);
      } else {
        setError(result.message || 'Failed to fetch audit data');
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError('Failed to load audit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!study) {
    return (
      <div className="riskeval-container">
        <div className="assessment-back-link" onClick={() => navigate('/assessed-studies')} style={{ cursor: 'pointer', color: 'var(--color-muted)', marginBottom: 18 }}>
          &larr; Back to Assessment Studies
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
          No study data available. Please select a study from the assessment list.
        </div>
      </div>
    );
  }

  return (
    <div className="riskeval-container">
      <div className="assessment-back-link" onClick={() => navigate('/assessed-studies')} style={{ cursor: 'pointer', color: 'var(--color-muted)', marginBottom: 18 }}>
        &larr; Back to Assessment Studies
      </div>
      <StudyInfoExpander study={study} />
      
      <Expander title="Assessment Audit" defaultExpanded>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
            Loading audit data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545', background: '#f8d7da', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Audit Table */}
        {!loading && !error && (
          <>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-muted)' }}>
              {auditData.length} audit records
            </div>
            
            <div className="riskeval-risk-table-wrapper">
              <table className="riskeval-risk-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Risk Factor</th>
                    <th>Field Name</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Changed By</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.length > 0 ? (
                    auditData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.timestamp}</td>
                        <td style={{ fontWeight: '500' }}>{row.riskFactor}</td>
                        <td>{row.field}</td>
                        <td style={{ color: '#dc3545' }}>{row.oldValue || '-'}</td>
                        <td style={{ color: '#28a745', fontWeight: '500' }}>{row.newValue || '-'}</td>
                        <td>{row.changedBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                        No audit data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Expander>
    </div>
  );
};

export default AssessmentAudit; 