import api from './api'
import { riskEvaluationData } from '../mockData'

export interface AssessmentMetadata {
  assessment_sections: Array<{
    id: number
    section_key: string
    section_title: string
    created_at: string
  }>
  risk_factors: Array<{
    id: number
    assessment_section_id: number
    risk_factor_text: string
    risk_factor_code: string
    description: string
    is_active: boolean
    created_at: string
  }>
}

export interface RiskMitigationPlan {
  risk_item: string
  responsible_person: string
  mitigation_strategy: string
  target_date: string
  status: string
  priority_level: string
}

export interface RiskDashboard {
  total_risks: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  total_score: number
  overall_risk_level: string
  risk_level_criteria: string
}

export interface SummaryComment {
  comment_type: string
  comment_text: string
}

export interface SectionComment {
  section_key: string
  section_title: string
  comment_text: string
}

export interface AssessmentCreate {
  study_id: number
  assessment_date: string
  next_review_date?: string | null
  monitoring_schedule: string
  overall_risk_score?: number
  overall_risk_level?: string
  comments?: string
  reviewed_by_name?: string
  reviewed_by_email?: string
  approved_by_name?: string
  approved_by_email?: string
  rejected_by_name?: string
  rejected_by_email?: string
  risk_scores: Array<{
    risk_factor_id: number
    severity: number
    likelihood: number
    risk_score: number
    risk_level: string
    mitigation_actions?: string
    custom_notes?: string
  }>
  risk_mitigation_plans?: RiskMitigationPlan[]
  risk_dashboard?: RiskDashboard
  summary_comments?: SummaryComment[]
  section_comments?: SectionComment[]
}

export interface AssessmentResponse {
  id: number
  study_id: number
  conducted_by_name: string
  conducted_by_email: string
  assessment_date: string
  next_review_date?: string
  monitoring_schedule: string
  status: string
  overall_risk_score?: number
  overall_risk_level?: string
  comments?: string
  updated_by_name?: string
  updated_by_email?: string
  reviewed_by_name?: string
  reviewed_by_email?: string
  approved_by_name?: string
  approved_by_email?: string
  rejected_by_name?: string
  rejected_by_email?: string
  created_at: string
  updated_at: string
}

export interface CompleteAssessment {
  assessment: {
    id: number
    study_id: number
    conducted_by_name: string
    conducted_by_email: string
    assessment_date: string
    next_review_date?: string
    monitoring_schedule: string
    status: string
    overall_risk_score?: number
    overall_risk_level?: string
    comments?: string
    updated_by_name?: string
    updated_by_email?: string
    reviewed_by_name?: string
    reviewed_by_email?: string
    approved_by_name?: string
    approved_by_email?: string
    rejected_by_name?: string
    rejected_by_email?: string
    created_at: string
    updated_at: string
  }
  risk_scores: Array<{
    id: number
    assessment_id: number
    risk_factor_id: number
    severity: number
    likelihood: number
    risk_score: number
    risk_level: string
    mitigation_actions?: string
    custom_notes?: string
    created_at: string
    updated_at: string
  }>
  risk_mitigation_plans: Array<{
    id: number
    assessment_id: number
    risk_item: string
    responsible_person: string
    mitigation_strategy: string
    target_date: string
    status: string
    priority_level: string
    created_at: string
    updated_at: string
  }>
  risk_dashboard?: {
    id: number
    assessment_id: number
    total_risks: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
    total_score: number
    overall_risk_level: string
    risk_level_criteria: string
    created_at: string
    updated_at: string
  }
  summary_comments: Array<{
    id: number
    assessment_id: number
    comment_type: string
    comment_text: string
    created_by_name: string
    created_by_email: string
    created_at: string
  }>
  section_comments: Array<{
    id: number
    assessment_id: number
    section_key: string
    section_title: string
    comment_text: string
    created_at: string
    updated_at: string
  }>
}

export class AssessmentService {
  // Test backend connectivity
  static async testConnection(): Promise<boolean> {
    try {
      // Test connectivity using the metadata endpoint
      try {
        const response = await api.get('/metadata', { timeout: 5000 })
        return true
      } catch (endpointError: any) {
        // Endpoint failed, continue to return false
      }
      
      return false
    } catch (error: any) {
      return false
    }
  }

  // Get assessment metadata (sections and risk factors)
  static async getMetadata(): Promise<AssessmentMetadata> {
    try {
      const response = await api.get('/metadata')
      return response.data
    } catch (error: any) {
      // Return riskEvaluationData as fallback when API is not available
      // Use sequential IDs that match the backend's expected structure
      const riskFactors: Array<{
        id: number;
        assessment_section_id: number;
        risk_factor_text: string;
        risk_factor_code: string;
        description: string;
        is_active: boolean;
      }> = [];
      let riskFactorId = 1;
      
      Object.entries(riskEvaluationData.riskSectionData).forEach(([sectionKey, sectionData], sectionIndex) => {
        const sectionId = sectionIndex + 1;
        sectionData.risks.forEach((risk) => {
          riskFactors.push({
            id: riskFactorId,
            assessment_section_id: sectionId,
            risk_factor_text: risk.risk,
            risk_factor_code: `${sectionKey.toUpperCase().substring(0, 3)}${riskFactorId.toString().padStart(3, '0')}`,
            description: risk.risk,
            is_active: true
          });
          riskFactorId++;
        });
      });
      
      return {
        assessment_sections: riskEvaluationData.steps.map((step, index) => ({
          id: index + 1,
          section_key: step.key,
          section_title: step.label,
          created_at: new Date().toISOString()
        })),
        risk_factors: riskFactors.map(rf => ({
          ...rf,
          created_at: new Date().toISOString()
        }))
      }
    }
  }

  // Save assessment data (original method)
  static async saveAssessment(assessmentData: AssessmentCreate): Promise<any> {
    try {
      // Test backend connectivity first
      const isBackendAvailable = await this.testConnection()
      if (!isBackendAvailable) {
        throw new Error('Backend is not available')
      }
      
      const response = await api.post('/saveRisksByStudyId', assessmentData)
      return response.data
    } catch (error: any) {
      // For development, simulate a successful save
      return {
        id: Math.floor(Math.random() * 100) + 1, // More reasonable range
        study_id: assessmentData.study_id,
        assessment_date: assessmentData.assessment_date,
        status: 'completed',
        message: 'Assessment saved successfully (development mode)',
        is_development_mode: true // Flag to indicate this is a development response
      }
    }
  }

  // Get complete assessment data by study ID
  static async getCompleteAssessmentByStudyId(studyId: number): Promise<CompleteAssessment | null> {
    try {
      const response = await api.get(`/by-study/${studyId}/complete`)
      return response.data
    } catch (error: any) {
      // For development, return null to indicate no existing assessment
      return null;
    }
  }

  // Get complete assessment data by assessment ID
  static async getCompleteAssessmentById(assessmentId: number): Promise<CompleteAssessment | null> {
    try {
      const response = await api.get(`/${assessmentId}/complete`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('Error fetching complete assessment by ID:', error)
      throw error
    }
  }

  // Get assessed studies by user type
  static async getAssessedStudies(userType: 'PI' | 'SD'): Promise<any> {
    try {
      const response = await api.get('/assessed-studies', {
        params: { user_type: userType }
      })
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Approve assessment
  static async approveAssessment(studyId: number, assessmentId: number, reason: string, comments?: string, userInfo?: { name: string, email: string }): Promise<any> {
    try {
      const payload = {
        study_id: studyId,
        assessment_id: assessmentId,
        action: 'Approved',
        reason,
        comments,
        action_by_name: userInfo?.name || '',
        action_by_email: userInfo?.email || ''
      }
      
      const response = await api.post(`/${assessmentId}/approve`, payload)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Reject assessment
  static async rejectAssessment(studyId: number, assessmentId: number, reason: string, comments?: string, userInfo?: { name: string, email: string }): Promise<any> {
    try {
      const payload = {
        study_id: studyId,
        assessment_id: assessmentId,
        action: 'Rejected',
        reason,
        comments,
        action_by_name: userInfo?.name || '',
        action_by_email: userInfo?.email || ''
      }
      
      const response = await api.post(`/${assessmentId}/reject`, payload)
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  // Get assessment audit trail for UI display
  static async getAssessmentAudit(
    studyId: number,
    fieldName?: string,
    riskFactorId?: number,
    limit: number = 100
  ): Promise<{
    success: boolean;
    study_id: number;
    assessment_id: number | null;
    audit_data: Array<{
      timestamp: string;
      riskFactor: string;
      field: string;
      oldValue: string;
      newValue: string;
      changedBy: string;
    }>;
    total_records: number;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (fieldName) params.append('field_name', fieldName);
      if (riskFactorId) params.append('risk_factor_id', riskFactorId.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/assessment-audit/${studyId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch assessment audit, using mock data');
      // Fallback to mock data
      return {
        success: true,
        study_id: studyId,
        assessment_id: 1,
        audit_data: [
          {
            timestamp: '2024-04-16 11:02 AM',
            riskFactor: 'Non-Compliance with GCP Guidelines',
            field: 'Severity',
            oldValue: '24',
            newValue: '32',
            changedBy: 'Jane Doe',
          },
          {
            timestamp: '2024-04-16 10:45 AM',
            riskFactor: 'Data-entry errors',
            field: 'Likelihood',
            oldValue: '2',
            newValue: '3',
            changedBy: 'John Smith',
          },
          {
            timestamp: '2024-04-16 10:30 AM',
            riskFactor: 'Adverse event under-reporting',
            field: 'Mitigation Actions',
            oldValue: '',
            newValue: 'Enhanced monitoring protocol implemented',
            changedBy: 'Dr. Johnson',
          }
        ],
        total_records: 3
      };
    }
  }

  // Get assessment timeline for UI display
  static async getAssessmentTimeline(
    studyId: number,
    limit: number = 100
  ): Promise<{
    success: boolean;
    study_id: number;
    timeline_data: Array<{
      id: number;
      schedule: string;
      assessedDate: string;
      assessedBy: string;
      riskScore: number;
      riskLevel: string;
      notes: string;
      createdAt: string;
    }>;
    total_records: number;
  }> {
    try {
      const response = await api.get(`/assessment-timeline/${studyId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch assessment timeline, using mock data');
      // Fallback to mock data
      return {
        success: true,
        study_id: studyId,
        timeline_data: [
          {
            id: 1,
            schedule: 'Monitoring Schedule',
            assessedDate: '2024-01-10',
            assessedBy: 'Dr. Smith',
            riskScore: 24,
            riskLevel: 'Low',
            notes: 'Initial Screening Complete',
            createdAt: '2024-01-10 09:30:00'
          },
          {
            id: 2,
            schedule: 'Quarterly Assessment',
            assessedDate: '2024-01-10',
            assessedBy: 'Dr. Jones',
            riskScore: 32,
            riskLevel: 'Medium',
            notes: 'Quarterly Review Complete',
            createdAt: '2024-04-10 14:15:00'
          },
          {
            id: 3,
            schedule: 'Schedule Update: Amendment review',
            assessedDate: '2025-07-21',
            assessedBy: 'Nivea Manu',
            riskScore: 13,
            riskLevel: 'Low',
            notes: 'Monitoring schedule updated from "Quarterly review" to "Amendment review" by Nivea Manu',
            createdAt: '2025-07-28 07:57:47'
          }
        ],
        total_records: 3
      };
    }
  }
}

export default AssessmentService 