from unittest.mock import AsyncMock, patch

from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken

from django.contrib.auth.models import AnonymousUser
from django.test import TestCase, TransactionTestCase, override_settings

from apps.accounts.models import Organization, User

from .consumers import NotificationConsumer
from .middleware import JWTAuthMiddleware, get_user_from_token
from .services import notify_count_update, notify_new_notification

TEST_CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


class JWTAuthMiddlewareTest(TransactionTestCase):
    """Tests for WebSocket JWT authentication middleware."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.user = User.objects.create_user(
            username="wsuser",
            email="ws@test.com",
            password="Test@1234",
            organization=self.org,
        )

    async def test_valid_token_resolves_user(self):
        token = str(AccessToken.for_user(self.user))
        user = await get_user_from_token(token)
        self.assertEqual(user.id, self.user.id)
        self.assertEqual(user.organization_id, self.org.id)

    async def test_invalid_token_returns_anonymous(self):
        user = await get_user_from_token("invalid-token-string")
        self.assertIsInstance(user, AnonymousUser)

    async def test_empty_token_returns_anonymous(self):
        user = await get_user_from_token("")
        self.assertIsInstance(user, AnonymousUser)


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class NotificationConsumerTest(TransactionTestCase):
    """Tests for WebSocket notification consumer."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.user = User.objects.create_user(
            username="wsuser",
            email="ws@test.com",
            password="Test@1234",
            organization=self.org,
        )

    async def test_authenticated_user_can_connect(self):
        token = str(AccessToken.for_user(self.user))
        communicator = WebsocketCommunicator(
            JWTAuthMiddleware(NotificationConsumer.as_asgi()),
            f"/ws/notifications/?token={token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_unauthenticated_user_rejected(self):
        communicator = WebsocketCommunicator(
            JWTAuthMiddleware(NotificationConsumer.as_asgi()),
            "/ws/notifications/",
        )
        connected, code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(code, 4401)

    async def test_invalid_token_rejected(self):
        communicator = WebsocketCommunicator(
            JWTAuthMiddleware(NotificationConsumer.as_asgi()),
            "/ws/notifications/?token=bad-token",
        )
        connected, code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(code, 4401)

    async def test_receives_new_notification_event(self):
        token = str(AccessToken.for_user(self.user))
        communicator = WebsocketCommunicator(
            JWTAuthMiddleware(NotificationConsumer.as_asgi()),
            f"/ws/notifications/?token={token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Simulate a group_send from the services layer
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"org_{self.org.id}",
            {
                "type": "notification.new",
                "notification": {
                    "type": "player_pending",
                    "title": "Novo jogador",
                    "message": "Test player",
                },
            },
        )

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "new_notification")
        self.assertEqual(response["notification"]["title"], "Novo jogador")
        await communicator.disconnect()

    async def test_receives_count_update_event(self):
        token = str(AccessToken.for_user(self.user))
        communicator = WebsocketCommunicator(
            JWTAuthMiddleware(NotificationConsumer.as_asgi()),
            f"/ws/notifications/?token={token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"org_{self.org.id}",
            {
                "type": "notification.count_update",
            },
        )

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "unread_count_update")
        await communicator.disconnect()


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class NotificationServicesTest(TestCase):
    """Tests for WebSocket dispatch service functions."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")

    @patch("apps.notifications.services.get_channel_layer")
    def test_notify_new_notification_calls_group_send(self, mock_get_layer):
        mock_layer = mock_get_layer.return_value
        mock_layer.group_send = AsyncMock()

        notify_new_notification(
            organization_id=str(self.org.id),
            notification_data={
                "type": "player_pending",
                "title": "Test",
                "message": "Test msg",
            },
        )

        mock_layer.group_send.assert_called_once()
        call_args = mock_layer.group_send.call_args
        self.assertEqual(call_args[0][0], f"org_{self.org.id}")
        self.assertEqual(call_args[0][1]["type"], "notification.new")

    @patch("apps.notifications.services.get_channel_layer")
    def test_notify_count_update_calls_group_send(self, mock_get_layer):
        mock_layer = mock_get_layer.return_value
        mock_layer.group_send = AsyncMock()

        notify_count_update(organization_id=str(self.org.id))

        mock_layer.group_send.assert_called_once()
        call_args = mock_layer.group_send.call_args
        self.assertEqual(call_args[0][0], f"org_{self.org.id}")
        self.assertEqual(call_args[0][1]["type"], "notification.count_update")

    @patch("apps.notifications.services.get_channel_layer")
    def test_notify_new_notification_handles_failure_gracefully(self, mock_get_layer):
        mock_layer = mock_get_layer.return_value
        mock_layer.group_send = AsyncMock(side_effect=Exception("Redis down"))

        # Should not raise
        notify_new_notification(
            organization_id=str(self.org.id),
            notification_data={"type": "test"},
        )

    @patch("apps.notifications.services.get_channel_layer")
    def test_notify_count_update_handles_failure_gracefully(self, mock_get_layer):
        mock_layer = mock_get_layer.return_value
        mock_layer.group_send = AsyncMock(side_effect=Exception("Redis down"))

        # Should not raise
        notify_count_update(organization_id=str(self.org.id))
