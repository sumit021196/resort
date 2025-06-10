import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, userData, logout } = useAuth(); // Use logout from context
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from the context
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!currentUser || !userData) {
    return null; // Don't render navbar if user is not logged in
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">VeggieSys</Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/stock" className="nav-link">{t('nav.liveStock')}</Link>
          </li>
          {(userData.role === 'admin' || userData.role === 'purchaseManager') && (
            <li className="nav-item">
              <Link to="/purchase/new" className="nav-link">{t('nav.purchaseEntry')}</Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/purchase/history" className="nav-link">{t('nav.purchaseHistory')}</Link>
          </li>
          {(userData.role === 'admin' || userData.role === 'kitchenStaff') && (
            <li className="nav-item">
              <Link to="/usage/new" className="nav-link">{t('nav.usageEntry')}</Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/usage/history" className="nav-link">{t('nav.usageHistory')}</Link>
          </li>
          {userData.role === 'admin' && (
            <li className="nav-item">
              <Link to="/admin/users" className="nav-link">{t('nav.manageUsers')}</Link>
            </li>
          )}
          {userData.role === 'admin' && (
            <li className="nav-item">
              <Link to="/audit" className="nav-link">{t('nav.auditLog')}</Link>
            </li>
          )}
        </ul>
        <div className="nav-user-info">
          <div className="language-switcher">
            <button onClick={() => i18n.changeLanguage('en')} disabled={i18n.language.startsWith('en')}>EN</button>
            <button onClick={() => i18n.changeLanguage('hi')} disabled={i18n.language.startsWith('hi')}>HI</button>
          </div>
          <span className="user-role">Role: {userData.role}</span>
          <button onClick={handleLogout} className="nav-logout-btn">{t('nav.logout')}</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
