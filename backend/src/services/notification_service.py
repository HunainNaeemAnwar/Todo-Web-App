"""
Notification service placeholder that is disabled in the initial version.
This service is intentionally not implemented for the initial release.
"""

class NotificationService:
    """
    Placeholder for notification service.

    According to requirement FR-010, notification capabilities are not included
    in the initial version of the system. This service is intentionally disabled.
    """

    def __init__(self):
        # This service is disabled in the initial version
        self.enabled = False

    def send_notification(self, user_id: str, message: str, notification_type: str = "info"):
        """
        Placeholder method for sending notifications.

        In the initial version, this method does nothing as notifications are disabled.
        """
        if not self.enabled:
            # Log that notifications are disabled but don't send anything
            print(f"INFO: Notifications are disabled in initial version. Would send: {message}")
            return {"status": "disabled", "message": "Notifications not sent - feature disabled in initial version"}

    def get_notifications_for_user(self, user_id: str):
        """
        Placeholder method for retrieving notifications for a user.

        In the initial version, this method returns an empty list as notifications are disabled.
        """
        if not self.enabled:
            return []

    def mark_notification_as_read(self, notification_id: str, user_id: str):
        """
        Placeholder method for marking a notification as read.

        In the initial version, this method does nothing as notifications are disabled.
        """
        if not self.enabled:
            return {"status": "disabled", "message": "Notifications not managed - feature disabled in initial version"}


# Global instance of the disabled notification service
notification_service = NotificationService()