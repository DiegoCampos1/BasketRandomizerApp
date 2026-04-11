from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    Authenticated users join their organization's group.
    Server-push only: clients connect/disconnect, server sends events.
    """

    async def connect(self):
        user = self.scope.get("user")
        if not user or user.is_anonymous or not getattr(user, "organization_id", None):
            await self.close(code=4401)
            return

        self.org_group = f"org_{user.organization_id}"
        await self.channel_layer.group_add(self.org_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "org_group"):
            await self.channel_layer.group_discard(self.org_group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        pass

    async def notification_new(self, event):
        """Handles type: 'notification.new' messages."""
        await self.send_json(
            {
                "type": "new_notification",
                "notification": event["notification"],
            }
        )

    async def notification_count_update(self, event):
        """Handles type: 'notification.count_update' messages."""
        await self.send_json(
            {
                "type": "unread_count_update",
            }
        )
