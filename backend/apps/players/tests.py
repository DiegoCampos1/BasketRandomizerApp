from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import Organization, User
from apps.notifications.models import Notification

from .models import Player


class PublicPlayerRegistrationTest(TestCase):
    """Tests for public player self-registration endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Boomerangs Basketball")
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def test_public_register_creates_unapproved_player(self):
        response = self.client.post(
            f"/api/v1/org/{self.org.slug}/players/register/",
            {"name": "João Silva", "height_cm": 185, "position": "forward"},
        )
        self.assertEqual(response.status_code, 201)

        player = Player.objects.get(name="João Silva")
        self.assertFalse(player.is_approved)
        self.assertEqual(player.quality, 0)
        self.assertEqual(player.organization, self.org)

    def test_public_register_creates_notification(self):
        self.client.post(
            f"/api/v1/org/{self.org.slug}/players/register/",
            {"name": "Carlos", "height_cm": 175, "position": "guard"},
        )

        notifications = Notification.objects.filter(user=self.admin)
        self.assertEqual(notifications.count(), 1)
        self.assertEqual(notifications.first().type, "player_pending")
        self.assertIn("Carlos", notifications.first().message)

    def test_public_register_invalid_slug_returns_404(self):
        response = self.client.post(
            "/api/v1/org/nonexistent-org/players/register/",
            {"name": "Test", "height_cm": 180, "position": "guard"},
        )
        self.assertEqual(response.status_code, 404)

    def test_public_register_invalid_height(self):
        response = self.client.post(
            f"/api/v1/org/{self.org.slug}/players/register/",
            {"name": "Test", "height_cm": 50, "position": "guard"},
        )
        self.assertEqual(response.status_code, 400)

    def test_public_register_missing_fields(self):
        response = self.client.post(
            f"/api/v1/org/{self.org.slug}/players/register/",
            {"name": "Test"},
        )
        self.assertEqual(response.status_code, 400)


class PlayerApprovalTest(TestCase):
    """Tests for player approval endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Test Org")
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="Test@1234",
            organization=self.org,
        )
        self.client.force_authenticate(user=self.admin)

        self.pending_player = Player.objects.create(
            name="Pending Player",
            height_cm=180,
            position="guard",
            quality=0,
            organization=self.org,
            is_approved=False,
        )

    def test_approve_player_sets_quality_and_flag(self):
        response = self.client.post(
            f"/api/v1/players/{self.pending_player.id}/approve/",
            {"quality": 4},
        )
        self.assertEqual(response.status_code, 200)

        self.pending_player.refresh_from_db()
        self.assertTrue(self.pending_player.is_approved)
        self.assertEqual(self.pending_player.quality, 4)

    def test_approve_already_approved_returns_400(self):
        approved = Player.objects.create(
            name="Already Approved",
            height_cm=175,
            position="forward",
            quality=3,
            organization=self.org,
            is_approved=True,
        )
        response = self.client.post(
            f"/api/v1/players/{approved.id}/approve/",
            {"quality": 5},
        )
        self.assertEqual(response.status_code, 400)

    def test_approve_without_quality_returns_400(self):
        response = self.client.post(
            f"/api/v1/players/{self.pending_player.id}/approve/",
            {},
        )
        self.assertEqual(response.status_code, 400)

    def test_approve_with_invalid_quality_returns_400(self):
        response = self.client.post(
            f"/api/v1/players/{self.pending_player.id}/approve/",
            {"quality": 6},
        )
        self.assertEqual(response.status_code, 400)

    def test_approve_marks_pending_notifications_as_read(self):
        Notification.objects.create(
            organization=self.org,
            user=self.admin,
            type="player_pending",
            title="Novo jogador",
            message="Test",
            related_player=self.pending_player,
        )

        self.client.post(
            f"/api/v1/players/{self.pending_player.id}/approve/",
            {"quality": 3},
        )

        notification = Notification.objects.first()
        self.assertTrue(notification.is_read)


class AdminPlayerCreationTest(TestCase):
    """Tests that admin-created players are auto-approved."""

    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Test Org")
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="Test@1234",
            organization=self.org,
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_created_player_is_approved(self):
        response = self.client.post(
            "/api/v1/players/",
            {"name": "Admin Player", "height_cm": 190, "position": "center", "quality": 4},
        )
        self.assertEqual(response.status_code, 201)

        player = Player.objects.get(name="Admin Player")
        self.assertTrue(player.is_approved)
