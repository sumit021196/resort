import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const { t } = useTranslation();
  const { currentUser, userData } = useAuth();

  return (
    <div className="home-container">
      <div className="user-info">
        <h2>{t('home.title')}</h2>
        {currentUser && userData ? (
          <div>
            <p>{t('home.greeting', { name: userData.name || currentUser.email })}</p>
            <p>{t('home.yourRole')} <strong>{userData.role}</strong></p>
          </div>
        ) : currentUser ? (
          <p>{t('home.loadingDetails', { email: currentUser.email })}</p>
        ) : (
          <p>{t('home.loginPrompt')}</p>
        )}
      </div>

      {/* Role-specific content */}
      {userData && (
        <div className="dashboard-options-container">
          <h4>{t('home.dashboardOptions')}</h4>
          {userData.role === 'admin' && (
            <ul>
              <li><Link to="/admin/users">{t('nav.manageUsers')}</Link></li>
              <li><Link to="/purchase/new">{t('home.recordNewPurchase')}</Link></li>
              <li><Link to="/usage/new">{t('home.recordDailyUsage')}</Link></li>
              <li><Link to="/stock">{t('nav.liveStock')}</Link></li>
              <li><a href="#admin-reports">{t('home.viewSystemReports')}</a></li>
              <li><a href="#admin-settings">{t('home.systemSettings')}</a></li>
            </ul>
          )}
          {userData.role === 'purchaseManager' && (
            <ul>
              <li><Link to="/purchase/new">{t('home.enterNewPurchase')}</Link></li>
              <li><Link to="/stock">{t('nav.liveStock')}</Link></li>
              <li><a href="#pm-purchase-log">{t('home.viewPurchaseLog')}</a></li>
              <li><a href="#pm-suppliers">{t('home.manageSuppliers')}</a></li>
            </ul>
          )}
          {userData.role === 'kitchenStaff' && (
            <ul>
              <li><Link to="/usage/new">{t('home.enterDailyUsage')}</Link></li>
              <li><Link to="/stock">{t('nav.liveStock')}</Link></li>
            </ul>
          )}
          {!['admin', 'purchaseManager', 'kitchenStaff'].includes(userData.role) && (
            <p>
              <Trans i18nKey="home.roleNotConfigured"
                     values={{ role: userData.role }}
                     components={{ 0: <em /> }}
              />
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;

