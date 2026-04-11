import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def notify_new_notification(organization_id, notification_data):
    """
    Send a new_notification event to all connected members of the organization.
    Called after bulk_create of notifications.
    """
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"org_{organization_id}",
            {
                "type": "notification.new",
                "notification": notification_data,
            },
        )
    except Exception:
        logger.exception("Failed to send WebSocket notification")


def notify_count_update(organization_id):
    """
    Send an unread_count_update event after mark-as-read operations.
    Clients will refetch their own count via REST.
    """
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"org_{organization_id}",
            {
                "type": "notification.count_update",
            },
        )
    except Exception:
        logger.exception("Failed to send WebSocket count update")
