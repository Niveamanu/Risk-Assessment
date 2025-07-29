import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudyInfoExpander from './StudyInfoExpander';
import Expander from './Expander';
import AssessmentService from '../services/assessmentService';
import './RiskEvaluation.css';

interface TimelineData {
  id: number;
  schedule: string;
  assessedDate: string;
  assessedBy: string;
  riskScore: number;
  riskLevel: string;
  notes: string;
  createdAt: string;
}

const AssessmentTimeline: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const study = location.state?.study;

  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (study?.id) {
      fetchTimelineData();
    }
  }, [study?.id]);

  const fetchTimelineData = async () => {
    if (!study?.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await AssessmentService.getAssessmentTimeline(study.id, 100);

      if (result.success) {
        setTimelineData(result.timeline_data);
      } else {
        setError('Failed to fetch timeline data');
      }
    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError('Failed to load timeline data. Please try again.');
    } finally {
      setLoading(false);
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

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '');
    } catch {
      return dateString;
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
      
      <Expander title="Assessment Timeline" defaultExpanded>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
            Loading timeline data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545', background: '#f8d7da', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Timeline Table */}
        {!loading && !error && (
          <>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-muted)' }}>
              {timelineData.length} timeline records
            </div>
            
            <div className="riskeval-risk-table-wrapper">
              <table className="riskeval-risk-table">
                <thead>
                  <tr>
                    {/* <th style={{ width: '5%' }}>#</th> */}
                    <th style={{ width: '20%' }}>Monitoring Schedule</th>
                    <th style={{ width: '12%' }}>Assessed Date</th>
                    <th style={{ width: '15%' }}>Assessed By</th>
                    <th style={{ width: '15%' }}>Created At</th>
                    <th style={{ width: '10%' }}>Risk Score</th>
                    <th style={{ width: '12%' }}>Risk Level</th>
                    <th style={{ width: '26%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.length > 0 ? (
                    timelineData.map((row) => (
                      <tr key={row.id}>
                        {/* <td style={{ textAlign: 'center', fontWeight: '500' }}>{row.id}</td> */}
                        <td style={{ fontWeight: '500' }}>{row.schedule}</td>
                        <td>{formatDate(row.assessedDate)}</td>
                        <td>{row.assessedBy}</td>
                        <td>{formatTimestamp(row.createdAt)}</td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{row.riskScore}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`risk-badge ${getRiskLevelBadgeClass(row.riskLevel)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {row.riskLevel}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', lineHeight: '1.4', color: '#666' }}>{row.notes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                        No timeline data available
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

export default AssessmentTimeline; 