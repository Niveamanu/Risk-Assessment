import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronDown, FiBell } from 'react-icons/fi';
import './Navbar.css';
import logo from '../assets/Flourish_Logo.png';
import NotificationPopup from './NotificationPopup';
import NotificationService from '../services/notificationService';
import { useUserRoles } from '../hooks/useUserRoles';

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useUserRoles();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setLoadingCount(true);
        const userType = isAdmin ? 'SD' : 'PI';
        const count = await NotificationService.getUnreadCount(userType);
        setUnreadCount(count);
      } catch (error) {
        console.warn('Failed to fetch unread notification count');
        setUnreadCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchUnreadCount();

    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
  };

  // Update unread count when notification popup closes
  const handleNotificationClose = () => {
    setNotificationOpen(false);
    // Refresh the count after popup closes
    const fetchUnreadCount = async () => {
      try {
        const userType = isAdmin ? 'SD' : 'PI';
        const count = await NotificationService.getUnreadCount(userType);
        setUnreadCount(count);
      } catch (error) {
        console.warn('Failed to refresh unread count');
      }
    };
    fetchUnreadCount();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Flourish Logo" className="navbar-logo" />
          <span className="navbar-title">FLOURISH <span className="navbar-title-sub">RESEARCH</span></span>
        </div>
        <div className="navbar-center">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/study-list" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Study List</NavLink>
          <NavLink to="/risk-evaluation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Risk Evaluation</NavLink>
          <NavLink to="/assessed-studies" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Assessed Studies</NavLink>
        </div>
        <div className="navbar-right">
          <div className="navbar-bell-container">
            <FiBell className="navbar-bell" onClick={handleNotificationClick} />
            {!loadingCount && unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="navbar-user" ref={dropdownRef}>
            <span className="navbar-user-label">{userName}</span>
            <span className="navbar-avatar">{getInitials(userName)}</span>
            <FiChevronDown className="navbar-chevron" onClick={() => setDropdownOpen(v => !v)} />
            {dropdownOpen && (
              <div className="navbar-dropdown">
                <button className="navbar-dropdown-item" onClick={onLogout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <NotificationPopup 
        isOpen={notificationOpen} 
        onClose={handleNotificationClose} 
      />
    </>
  );
};

export default Navbar; 