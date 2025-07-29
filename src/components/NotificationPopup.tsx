import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiEye, FiCheck, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '../hooks/useUserRoles';
import NotificationService, { AssessmentNotification } from '../services/notificationService';
import './NotificationPopup.css';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AssessmentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch notifications when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, isAdmin]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userType = isAdmin ? 'SD' : 'PI';
      const response = await NotificationService.getNotifications(userType);
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userType = isAdmin ? 'SD' : 'PI';
      await NotificationService.markAllAsRead(userType);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications as read');
    }
  };

  const handleViewAssessment = (notification: AssessmentNotification) => {
    // Create a study object that matches what RiskEvaluation expects
    const studyData = {
      // Use siteid as study_id since that's likely what the authorization endpoint expects
      study_id: notification.study_info?.siteid || 0,
      site: notification.study_info?.site || '',
      sponsor: notification.study_info?.sponsor || '',
      protocol: notification.study_info?.protocol || '',
      study_type: notification.study_info?.study_type || '',
      study_type_text: notification.study_info?.study_type_text || '',
      description: notification.study_info?.study_description || '',
      study_status: notification.study_info?.study_status || '',
      phase: notification.study_info?.phase || '',
      monitoring_schedule: notification.study_info?.monitoring_schedule || '',
      siteid: notification.study_info?.siteid || 0,
      studyid: notification.study_info?.studyid || '',
      active: notification.study_info?.active || false,
      principal_investigator: notification.study_info?.principal_investigator || '',
      principal_investigator_email: notification.study_info?.principal_investigator_email || '',
      site_director: notification.study_info?.site_director || '',
      site_director_email: notification.study_info?.site_director_email || '',
      assessment_status: notification.assessment_info?.status || '',
      sponsor_code: notification.study_info?.sponsor_code || '',
      created_at: notification.study_info?.created_at || '',
      // Assessment data
      assessment_id: notification.assessment_id,
      assessment_date: notification.assessment_info?.assessment_date || '',
      next_review_date: notification.assessment_info?.next_review_date || '',
      conducted_by_name: notification.assessment_info?.conducted_by_name || '',
      conducted_by_email: notification.assessment_info?.conducted_by_email || '',
      updated_by_name: notification.assessment_info?.updated_by_name || '',
      updated_by_email: notification.assessment_info?.updated_by_email || ''
    };

    navigate(`/risk-evaluation/${notification.assessment_id}?studyId=${studyData.study_id}`, {
      state: { study: studyData }
    });
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (action: string) => {
    switch (action) {
      case 'Initial Save':
        return <FiClock className="notification-icon-clock" />;
      case 'Approved':
        return <FiCheck className="notification-icon-check" />;
      case 'Rejected':
        return <FiX className="notification-icon-x" />;
      case 'SD Created':
        return <FiUser className="notification-icon-user" />;
      default:
        return <FiEye className="notification-icon-eye" />;
    }
  };

  const getNotificationMessage = (notification: AssessmentNotification) => {
    if (isAdmin) {
      // SD view - show PI submissions that need review
      return (
        <div className="notification-message">
          <div className="notification-title">
            Assessment #{notification.assessment_id} needs your review
          </div>
          <div className="notification-details">
            <strong>{notification.pi_name}</strong> has submitted an assessment for review
          </div>
          <div className="notification-study">
            {notification.study_info?.site} • {notification.study_info?.protocol}
          </div>
        </div>
      );
    } else {
      // PI view - show SD reviews/approvals AND SD-created assessments
      if (notification.action === 'SD Created') {
        return (
          <div className="notification-message">
            <div className="notification-title">
              Assessment #{notification.assessment_id} created by Study Director
            </div>
            <div className="notification-details">
              <strong>{notification.sd_name}</strong> has created an assessment that requires your review
            </div>
            <div className="notification-study">
              {notification.study_info?.site} • {notification.study_info?.protocol}
            </div>
          </div>
        );
      } else {
        return (
          <div className="notification-message">
            <div className="notification-title">
              Assessment #{notification.assessment_id} has been {notification.action.toLowerCase()}
            </div>
            <div className="notification-details">
              <strong>{notification.sd_name}</strong> has {notification.action.toLowerCase()} your assessment
            </div>
            <div className="notification-study">
              {notification.study_info?.site} • {notification.study_info?.protocol}
            </div>
          </div>
        );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup" ref={popupRef}>
        <div className="notification-popup-header">
          <div className="notification-popup-title">
            <span className="notification-popup-icon">🔔</span>
            Notifications
            {unreadCount > 0 && (
              <span className="notification-popup-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notification-popup-actions">
            {unreadCount > 0 && (
              <button 
                className="notification-mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
            <button className="notification-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="notification-popup-content">
          {loading && (
            <div className="notification-loading">
              <div className="loading-spinner"></div>
              <span>Loading notifications...</span>
            </div>
          )}

          {error && (
            <div className="notification-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="notification-empty">
              <span className="notification-empty-icon">📭</span>
              <span>No notifications</span>
              <span className="notification-empty-subtitle">
                You're all caught up!
              </span>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.action)}
                  </div>
                  <div className="notification-item-content">
                    {getNotificationMessage(notification)}
                    <div className="notification-item-time">
                      {formatDate(notification.action_date)}
                    </div>
                  </div>
                  <div className="notification-item-actions">
                    <button 
                      className="notification-view-btn"
                      onClick={() => handleViewAssessment(notification)}
                      title="View Assessment"
                    >
                      <FiEye />
                    </button>
                    {!notification.read && (
                      <button 
                        className="notification-mark-read-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup; 