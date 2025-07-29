import api from './api'
import { cascadingDropdownData } from '../mockData'

export interface StudyResponse {
  // New API response structure
  siteid: number
  site: string
  sponsor: string
  sponsor_code: string | null
  id: number
  studyid: string
  protocol: string
  studytype: string
  studytypetext: string
  status: string
  description: string
  phase: string
  active: boolean
  principal_investigator: string
  principal_investigator_email: string
  site_director: string | null
  site_director_email: string | null
  monitoring_schedule: string
  assessment_status: string
  
  // Legacy fields for backward compatibility (mapped from new structure)
  site_id?: number
  site_name?: string
  site_director_name?: string
  sponsor_name?: string
  sponsor_contact_person?: string
  sponsor_contact_email?: string
  sponsor_contact_phone?: string
  study_id?: number
  complete_protocol?: string
  irb?: string
  awarded_date?: string
  not_awarded_date?: string
  declined_date?: string
  actual_start_date?: string
  start_date?: string
  recruit_end?: string
  end_date?: string
  recruitment_goal?: number
  study_notes?: string
  advertising_budget?: number
  indication?: string
  cro?: string
  screen_fails?: string
  site_number?: string
  recruitment_notes?: string
  irb_number?: string
  study_type?: number
  study_type_text?: string
  admin_billing_type?: boolean
  web_enabled?: boolean
  principal_investigator_name?: string
  created_at?: string
}

export interface DropdownValues {
  sites: string[]
  sponsors: string[]
  protocols: string[]
}

export class StudiesService {
  // Get dropdown values for site, sponsor, and protocol
  static async getDropdownValues(type: 'PI' | 'SD'): Promise<DropdownValues> {
    try {
      const response = await api.get('/dropdown-values', {
        params: { type }
      })
      
      return response.data
    } catch (error) {
      console.warn('Failed to fetch dropdown values, using mock data');
      // Fallback to mock data
      return {
        sites: cascadingDropdownData.sites,
        sponsors: Array.from(new Set(Object.values(cascadingDropdownData.sponsorsBySite).flat())),
        protocols: Array.from(new Set(Object.values(cascadingDropdownData.protocolsBySiteAndSponsor).flatMap(sponsorData => Object.values(sponsorData).flat())))
      };
    }
  }

  // Get filtered sponsors based on selected site
  static async getFilteredSponsors(type: 'PI' | 'SD', site: string): Promise<string[]> {
    try {
      const response = await api.get('/filtered-sponsors', {
        params: { type, site }
      })
      
      return response.data.sponsors || []
    } catch (error) {
      console.warn('Failed to fetch filtered sponsors, using mock data');
      // Fallback to mock data
      return cascadingDropdownData.sponsorsBySite[site] || [];
    }
  }

  // Get filtered protocols based on selected site and sponsor
  static async getFilteredProtocols(type: 'PI' | 'SD', site: string, sponsor: string): Promise<string[]> {
    try {
      const response = await api.get('/filtered-protocols', {
        params: { type, site, sponsor }
      })
      
      return response.data.protocols || []
    } catch (error) {
      console.warn('Failed to fetch filtered protocols, using mock data');
      // Fallback to mock data
      return cascadingDropdownData.protocolsBySiteAndSponsor[site]?.[sponsor] || [];
    }
  }

  // Get studies by username and type (PI or SD) with optional filters
  static async getStudiesByUsername(
    type: 'PI' | 'SD', 
    site?: string, 
    sponsor?: string, 
    protocol?: string
  ): Promise<StudyResponse[]> {
    try {
      const params: any = { type }
      if (site && site !== 'All') params.site = site
      if (sponsor && sponsor !== 'All') params.sponsor = sponsor
      if (protocol && protocol !== 'All') params.protocol = protocol
      
      const response = await api.get('/getStudiesByUsername', { params })
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default StudiesService 