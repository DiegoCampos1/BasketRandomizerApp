from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import Organization, User
from apps.players.models import Player

from .models import Team, TeamPlayer
from .services import create_division, move_player


class DivisionServiceApprovalTest(TestCase):
    """Tests that division service only considers approved players."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.user = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def _create_player(self, name, quality=3, position="guard", height_cm=180, is_approved=True):
        return Player.objects.create(
            name=name,
            quality=quality,
            position=position,
            height_cm=height_cm,
            organization=self.org,
            is_approved=is_approved,
        )

    def test_division_only_includes_approved_players(self):
        """Approved players should be included in division."""
        approved = [self._create_player(f"Approved {i}", quality=i + 1) for i in range(4)]
        player_ids = [p.id for p in approved]

        division = create_division(self.user, player_ids, "2_teams", "2026-03-28")

        team_player_ids = set()
        for team in division.teams.all():
            for tp in team.team_players.all():
                team_player_ids.add(tp.player_id)

        self.assertEqual(team_player_ids, set(player_ids))

    def test_division_rejects_unapproved_players(self):
        """Unapproved players should cause a ValueError when included in division request."""
        approved = [self._create_player(f"Approved {i}", quality=i + 1) for i in range(3)]
        unapproved = self._create_player("Pending", quality=0, is_approved=False)

        player_ids = [p.id for p in approved] + [unapproved.id]

        with self.assertRaises(ValueError) as ctx:
            create_division(self.user, player_ids, "2_teams", "2026-03-28")

        self.assertIn("não foram encontrados", str(ctx.exception))

    def test_division_ignores_unapproved_not_in_list(self):
        """Unapproved players not in the request should not interfere."""
        approved = [self._create_player(f"Approved {i}", quality=i + 1) for i in range(4)]
        self._create_player("Pending 1", quality=0, is_approved=False)
        self._create_player("Pending 2", quality=0, is_approved=False)

        player_ids = [p.id for p in approved]

        division = create_division(self.user, player_ids, "2_teams", "2026-03-28")

        total_players = sum(team.team_players.count() for team in division.teams.all())
        self.assertEqual(total_players, 4)

    def test_division_rejects_inactive_players(self):
        """Inactive players should also be rejected."""
        approved = [self._create_player(f"Active {i}", quality=i + 1) for i in range(3)]
        inactive = self._create_player("Inactive", quality=3, is_approved=True)
        inactive.active = False
        inactive.save()

        player_ids = [p.id for p in approved] + [inactive.id]

        with self.assertRaises(ValueError):
            create_division(self.user, player_ids, "2_teams", "2026-03-28")

    def test_division_mix_approved_unapproved_count_mismatch(self):
        """Requesting 4 players where 1 is unapproved should fail (only 3 found)."""
        p1 = self._create_player("A1", quality=3)
        p2 = self._create_player("A2", quality=3)
        p3 = self._create_player("A3", quality=3)
        p4 = self._create_player("Pending", quality=0, is_approved=False)

        player_ids = [p1.id, p2.id, p3.id, p4.id]

        with self.assertRaises(ValueError):
            create_division(self.user, player_ids, "2_teams", "2026-03-28")


class DivisionServiceFourTeamsApprovalTest(TestCase):
    """Tests 4-team mode with approval filter."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org 4T")
        self.user = User.objects.create_user(
            username="admin4t",
            email="admin4t@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def _create_player(self, name, quality=3, position="guard", height_cm=180, is_approved=True):
        return Player.objects.create(
            name=name,
            quality=quality,
            position=position,
            height_cm=height_cm,
            organization=self.org,
            is_approved=is_approved,
        )

    def test_four_teams_only_approved(self):
        """4-team mode should work with only approved players."""
        positions = ["guard", "forward", "center", "guard", "forward", "center", "guard", "forward"]
        approved = [
            self._create_player(f"Player {i}", quality=(i % 5) + 1, position=positions[i])
            for i in range(8)
        ]
        # Add unapproved noise
        self._create_player("Pending", quality=0, is_approved=False)

        player_ids = [p.id for p in approved]

        division = create_division(self.user, player_ids, "4_teams", "2026-03-28")

        self.assertEqual(division.teams.count(), 4)
        total_players = sum(team.team_players.count() for team in division.teams.all())
        self.assertEqual(total_players, 8)


class MovePlayerTest(TestCase):
    """Tests for the move_player service."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org Move")
        self.user = User.objects.create_user(
            username="move_user",
            email="move@test.com",
            password="Test@1234",
            organization=self.org,
        )
        players = [
            Player.objects.create(
                name=f"Player {i}",
                quality=(i % 5) + 1,
                position="guard",
                height_cm=180,
                organization=self.org,
                is_approved=True,
            )
            for i in range(6)
        ]
        self.division = create_division(
            self.user,
            [p.id for p in players],
            "2_teams",
            "2026-04-11",
        )
        self.teams = list(self.division.teams.all())
        self.team_a = self.teams[0]
        self.team_b = self.teams[1]

    def test_move_player_to_other_team(self):
        tp = self.team_a.team_players.first()
        original_a_count = self.team_a.team_players.count()
        original_b_count = self.team_b.team_players.count()

        move_player(self.division.id, tp.id, self.team_b.id)

        tp.refresh_from_db()
        self.assertEqual(tp.team_id, self.team_b.id)
        self.assertEqual(self.team_a.team_players.count(), original_a_count - 1)
        self.assertEqual(self.team_b.team_players.count(), original_b_count + 1)

    def test_move_to_same_team_raises(self):
        tp = self.team_a.team_players.first()
        with self.assertRaises(ValueError) as ctx:
            move_player(self.division.id, tp.id, self.team_a.id)
        self.assertIn("já está neste time", str(ctx.exception))

    def test_move_nonexistent_team_player_raises(self):
        import uuid

        with self.assertRaises(TeamPlayer.DoesNotExist):
            move_player(self.division.id, uuid.uuid4(), self.team_b.id)

    def test_move_nonexistent_target_team_raises(self):
        import uuid

        tp = self.team_a.team_players.first()
        with self.assertRaises(Team.DoesNotExist):
            move_player(self.division.id, tp.id, uuid.uuid4())


class MovePlayerAPITest(TestCase):
    """Tests for the move endpoint via API."""

    def setUp(self):
        self.org = Organization.objects.create(name="Test Org API Move")
        self.user = User.objects.create_user(
            username="api_move",
            email="api_move@test.com",
            password="Test@1234",
            organization=self.org,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        players = [
            Player.objects.create(
                name=f"P{i}",
                quality=3,
                position="guard",
                height_cm=180,
                organization=self.org,
                is_approved=True,
            )
            for i in range(4)
        ]
        self.division = create_division(
            self.user,
            [p.id for p in players],
            "2_teams",
            "2026-04-11",
        )
        self.teams = list(self.division.teams.all())

    def test_move_via_api(self):
        tp = self.teams[0].team_players.first()
        response = self.client.post(
            f"/api/v1/divisions/{self.division.id}/move/",
            {
                "team_player_id": str(tp.id),
                "target_team_id": str(self.teams[1].id),
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("teams", response.data)

    def test_move_nonexistent_returns_404(self):
        import uuid

        response = self.client.post(
            f"/api/v1/divisions/{self.division.id}/move/",
            {
                "team_player_id": str(uuid.uuid4()),
                "target_team_id": str(self.teams[1].id),
            },
        )
        self.assertEqual(response.status_code, 404)

    def test_move_same_team_returns_400(self):
        tp = self.teams[0].team_players.first()
        response = self.client.post(
            f"/api/v1/divisions/{self.division.id}/move/",
            {
                "team_player_id": str(tp.id),
                "target_team_id": str(self.teams[0].id),
            },
        )
        self.assertEqual(response.status_code, 400)
