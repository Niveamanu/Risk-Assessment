import api from './api';
import { paginatedRiskTableFallback, riskTableFilterValuesFallback } from '../mockData';

export interface DashboardStats {
  total_active_sites: number;
  total_active_studies: number;
  total_assessed_studies: number;
  total_approved_assessments: number;
  total_rejected_assessments: number;
  total_reviews_pending: number;
  user_type: string;
  user_email: string;
}

export interface BarChartData {
  label: string;
  value: number;
  color: string;
}

export interface TopStudiesRiskChart {
  barChartData: BarChartData[];
  totalStudies: number;
}

export interface RiskTableData {
  study_id: number;
  site: string;
  sponsor: string;
  protocol: string;
  risk: number;
  assessment_id: number;
  // Additional fields needed for risk evaluation screen
  study_type: string;
  study_type_text: string;
  description: string;
  study_status: string;
  phase: string;
  monitoring_schedule: string;
  // Optional fields that may not be in all responses
  siteid?: number;
  studyid?: string;
  active?: boolean;
  principal_investigator?: string;
  principal_investigator_email?: string;
  site_director?: string | null;
  site_director_email?: string | null;
  assessment_status?: string;
  sponsor_code?: string | null;
  created_at?: string;
}

export interface AssessedStudiesHighestRisk {
  riskTableData: RiskTableData[];
  totalStudies: number;
}

export interface PaginatedRiskTableResponse {
  riskTableData: RiskTableData[];
  totalStudies: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface RiskTableFilterValues {
  sites: string[];
  sponsors: string[];
  protocols: string[];
}

export class DashboardService {
  // Get dashboard statistics for PI or Site Director
  static async getDashboardStats(userType: 'PI' | 'SD'): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard-stats', {
        params: { user_type: userType }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get top studies risk chart data
  static async getTopStudiesRiskChart(): Promise<TopStudiesRiskChart> {
    try {
      const response = await api.get('/top-studies-risk-chart');
      return response.data;
    } catch (error) {
      console.error('Error fetching top studies risk chart:', error);
      throw error;
    }
  }

  // Get assessed studies by highest risk data (limited to top 10 for dashboard)
  static async getAssessedStudiesHighestRisk(filterParams?: {
    site?: string;
    sponsor?: string;
    protocol?: string;
  }): Promise<AssessedStudiesHighestRisk> {
    try {
      const response = await api.get('/assessed-studies-highest-risk', {
        params: filterParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessed studies by highest risk:', error);
      throw error;
    }
  }

  // Get all assessed studies with pagination (for full risk table screen)
  static async getAllAssessedStudies(params?: {
    site?: string;
    sponsor?: string;
    protocol?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedRiskTableResponse> {
    try {
      const response = await api.get('/all-assessed-studies', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all assessed studies:', error);
      console.log('Using fallback data for paginated risk table');
      return paginatedRiskTableFallback;
    }
  }

  // Get distinct filter values for risk table
  static async getRiskTableFilterValues(): Promise<RiskTableFilterValues> {
    try {
      const response = await api.get('/risk-table-filter-values');
      return response.data;
    } catch (error) {
      console.error('Error fetching risk table filter values:', error);
      console.log('Using fallback data for risk table filter values');
      return riskTableFilterValuesFallback;
    }
  }

  // Check if current user has edit permissions for a study assessment
  static async checkAssessmentEditPermissions(studyId: number): Promise<{
    canEdit: boolean;
    userEmail: string;
    piEmail?: string;
    sdEmail?: string;
    reason?: string;
  }> {
    try {
      const response = await api.get(`/assessment-edit-permissions/${studyId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking assessment edit permissions:', error);
      // Default to read-only if check fails
      return {
        canEdit: false,
        userEmail: '',
        reason: 'Permission check failed'
      };
    }
  }
}

export default DashboardService; 