/**
 * Notifications component that is disabled in the initial version.
 * This component indicates that notification capabilities are not available.
 */
import React from 'react';

interface NotificationsDisabledProps {
  className?: string;
}

const NotificationsDisabled: React.FC<NotificationsDisabledProps> = ({ className }) => {
  return (
    <div className={`notifications-disabled ${className}`}>
      <div className="notification-item">
        <div className="notification-icon">🔔</div>
        <div className="notification-content">
          <h3>Notifications Disabled</h3>
          <p>
            Notification capabilities are not available in the initial version of this application.
            This feature will be implemented in a future release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDisabled;