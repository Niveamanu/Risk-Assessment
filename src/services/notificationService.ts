import api from './api';

export interface AssessmentNotification {
  id: number;
  assessment_id: number;
  action: string;
  action_by_name: string;
  action_by_email: string;
  reason: string;
  comments: string;
  action_date: string;
  read?: boolean; // Add read property for tracking read status
  study_info?: {
    site: string;
    sponsor: string;
    protocol: string;
    study_description: string;
    study_type: string;
    study_type_text: string;
    study_status: string;
    phase: string | null;
    monitoring_schedule: string;
    siteid: number;
    studyid: string;
    active: boolean;
    principal_investigator: string;
    principal_investigator_email: string;
    site_director: string;
    site_director_email: string;
    sponsor_code: string | null;
    created_at: string | null;
  };
  assessment_info?: {
    assessment_id: number;
    assessment_date: string;
    next_review_date: string;
    status: string;
    conducted_by_name: string;
    conducted_by_email: string;
    updated_by_name: string;
    updated_by_email: string;
    created_at: string;
    updated_at: string;
  };
  pi_name?: string;
  pi_email?: string;
  sd_name?: string;
  sd_email?: string;
}

export interface NotificationResponse {
  notifications: AssessmentNotification[];
  unread_count: number;
}

export interface CreateNotificationData {
  assessment_id: number;
  action: string;
  action_by_name: string;
  action_by_email: string;
  reason: string;
  comments: string;
  target_user_type: 'PI' | 'SD';
  study_id: number;
}

export class NotificationService {
  // Get notifications for current user based on their role
  static async getNotifications(userType: 'PI' | 'SD'): Promise<NotificationResponse> {
    try {
      const response = await api.get('/notifications', {
        params: { user_type: userType }
      });
      
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch notifications, using mock data');
      // Return mock data for development
      return this.getMockNotifications(userType);
    }
  }

  // Create a new notification
  static async createNotification(notificationData: CreateNotificationData): Promise<any> {
    try {
      const response = await api.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.warn('Failed to create notification:', error);
      // Don't throw error to avoid breaking the main workflow
      return { success: false, message: 'Notification creation failed' };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.warn('Failed to mark notification as read');
    }
  }

  // Get unread notification count for navbar badge
  static async getUnreadCount(userType: 'PI' | 'SD', useMockData: boolean = false): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count', {
        params: { user_type: userType }
      });
      
      return response.data.unread_count || 0;
    } catch (error) {
      console.warn('Failed to fetch unread count');
      
      // Only use mock data if explicitly requested (for development/testing)
      if (useMockData) {
        const mockResponse = this.getMockNotifications(userType);
        return mockResponse.unread_count;
      }
      
      // Return 0 instead of fallback data to avoid showing count before API call
      return 0;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userType: 'PI' | 'SD'): Promise<void> {
    try {
      await api.put('/notifications/mark-all-read', null, {
        params: { user_type: userType }
      });
    } catch (error) {
      console.warn('Failed to mark all notifications as read');
    }
  }

  // Mock notifications for development
  private static getMockNotifications(userType: 'PI' | 'SD'): NotificationResponse {
    if (userType === 'SD') {
      // Notifications for Study Director - show PI submissions that need review
      return {
        notifications: [
          {
            id: 1,
            assessment_id: 78,
            action: 'Initial Save',
            action_by_name: 'Faizal Adam Seyed Sihabudeen',
            action_by_email: 'faizaladam.feyedsihabudeen@agilisium.com',
            reason: 'Assessment saved',
            comments: 'Assessment data saved successfully',
            action_date: '2025-07-23 12:06:11.951',
            study_info: {
              site: 'Flourish San Antonio',
              sponsor: 'CinFina Pharma',
              protocol: 'CIN-110-112',
              study_description: 'Severe and Persistent Asthma',
              study_type: '1',
              study_type_text: 'Pulmonology',
              study_status: 'Enrolling',
              phase: '1',
              monitoring_schedule: 'Quarterly Review',
              siteid: 1,
              studyid: 'CIN-110-112',
              active: true,
              principal_investigator: 'Faizal Adam Seyed Sihabudeen',
              principal_investigator_email: 'faizaladam.feyedsihabudeen@agilisium.com',
              site_director: 'Ahmed UmarBasha',
              site_director_email: 'ahmed.umarbasha@agilisium.com',
              sponsor_code: 'CP001',
              created_at: '2024-01-15'
            },
            assessment_info: {
              assessment_id: 78,
              assessment_date: '2025-07-23',
              next_review_date: '2025-07-30',
              status: 'In Progress',
              conducted_by_name: 'Faizal Adam Seyed Sihabudeen',
              conducted_by_email: 'faizaladam.feyedsihabudeen@agilisium.com',
              updated_by_name: 'Faizal Adam Seyed Sihabudeen',
              updated_by_email: 'faizaladam.feyedsihabudeen@agilisium.com',
              created_at: '2025-07-23T12:06:11.951',
              updated_at: '2025-07-23T12:06:11.951'
            },
            pi_name: 'Faizal Adam Seyed Sihabudeen',
            pi_email: 'faizaladam.feyedsihabudeen@agilisium.com',
            sd_name: 'Ahmed UmarBasha',
            sd_email: 'ahmed.umarbasha@agilisium.com'
          },
          {
            id: 2,
            assessment_id: 75,
            action: 'Initial Save',
            action_by_name: 'Balasubramaniyan Rengasamy',
            action_by_email: 'balasubramaniyan.rengasamy@agilisium.com',
            reason: 'Assessment saved',
            comments: 'Assessment data saved successfully',
            action_date: '2025-07-21 11:23:06.818',
            study_info: {
              site: 'Flourish Orlando AstraZeneca',
              sponsor: 'AstraZeneca',
              protocol: 'D7650C000001',
              study_description: 'Chronic Obstructive Pulmonary Disease',
              study_type: '2',
              study_type_text: 'Pulmonology',
              study_status: 'Study Completed',
              phase: '3',
              monitoring_schedule: 'Final Review',
              siteid: 2,
              studyid: 'D7650C000001',
              active: false,
              principal_investigator: 'Balasubramaniyan Rengasamy',
              principal_investigator_email: 'balasubramaniyan.rengasamy@agilisium.com',
              site_director: 'Ahmed UmarBasha',
              site_director_email: 'ahmed.umarbasha@agilisium.com',
              sponsor_code: 'AZ002',
              created_at: '2024-02-20'
            },
            assessment_info: {
              assessment_id: 75,
              assessment_date: '2025-07-21',
              next_review_date: '2025-07-28',
              status: 'In Progress',
              conducted_by_name: 'Balasubramaniyan Rengasamy',
              conducted_by_email: 'balasubramaniyan.rengasamy@agilisium.com',
              updated_by_name: 'Balasubramaniyan Rengasamy',
              updated_by_email: 'balasubramaniyan.rengasamy@agilisium.com',
              created_at: '2025-07-21T11:23:06.818',
              updated_at: '2025-07-21T11:23:06.818'
            },
            pi_name: 'Balasubramaniyan Rengasamy',
            pi_email: 'balasubramaniyan.rengasamy@agilisium.com',
            sd_name: 'Ahmed UmarBasha',
            sd_email: 'ahmed.umarbasha@agilisium.com'
          }
        ],
        unread_count: 2
      };
    } else {
      // Notifications for Principal Investigator - show SD reviews/approvals AND SD-created assessments
      return {
        notifications: [
          {
            id: 4,
            assessment_id: 87,
            action: 'Initial Save',
            action_by_name: 'Nivea Manu',
            action_by_email: 'nivea.manu@agilisium.com',
            reason: 'Assessment saved by Principal Investigator',
            comments: 'Assessment data saved successfully by PI',
            action_date: '2025-07-29T14:46:05.159953',
            study_info: {
              site: 'flourish san antonio',
              sponsor: 'RegenLab USA',
              protocol: 'RL 04',
              study_description: 'Knee Osteoarthritis',
              study_type: '18',
              study_type_text: 'Rheumatology',
              study_status: 'Study Completed',
              phase: null,
              monitoring_schedule: 'Initial assessment',
              siteid: 1,
              studyid: '868',
              active: true,
              principal_investigator: 'Nivea Manu',
              principal_investigator_email: 'nivea.manu@agilisium.com',
              site_director: 'Ahmed UmarBasha',
              site_director_email: 'ahmed.umarbasha@agilisium.com',
              sponsor_code: null,
              created_at: null
            },
            assessment_info: {
              assessment_id: 87,
              assessment_date: '2025-07-29',
              next_review_date: '2025-07-31',
              status: 'In Progress',
              conducted_by_name: 'Nivea Manu',
              conducted_by_email: 'nivea.manu@agilisium.com',
              updated_by_name: 'Nivea Manu',
              updated_by_email: 'nivea.manu@agilisium.com',
              created_at: '2025-07-29T07:24:01.527387',
              updated_at: '2025-07-29T07:24:01.527387'
            },
            pi_name: 'Nivea Manu',
            pi_email: 'nivea.manu@agilisium.com',
            sd_name: 'Ahmed UmarBasha',
            sd_email: 'ahmed.umarbasha@agilisium.com'
          }
        ],
        unread_count: 1
      };
    }
  }
}

export default NotificationService; 