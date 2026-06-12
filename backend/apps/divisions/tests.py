import random

from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import Organization, User
from apps.players.models import Player

from .algorithm import PlayerProfile, TeamSlot, _balance_matchup_quality, divide_teams
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


class FourTeamSubteam1SizeTest(TestCase):
    """
    With 10+ players in 4-team mode, Vermelho 1 and Preto 1 must have exactly
    5 players each, and the remainder fills Vermelho 2 / Preto 2.
    """

    def setUp(self):
        self.org = Organization.objects.create(name="Org Subteam1")
        self.user = User.objects.create_user(
            username="subteam1",
            email="subteam1@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def _make_players(self, n):
        positions = ["guard", "forward", "center"]
        return [
            Player.objects.create(
                name=f"P{i}",
                quality=(i % 5) + 1,
                position=positions[i % 3],
                height_cm=170 + (i % 25),
                organization=self.org,
                is_approved=True,
            )
            for i in range(n)
        ]

    def _subteam_sizes(self, division):
        sizes = {}
        for team in division.teams.all():
            sizes[team.name] = team.team_players.count()
        return sizes

    def _assert_v1_p1_have_five(self, total):
        players = self._make_players(total)
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-05-07")
        sizes = self._subteam_sizes(division)
        self.assertEqual(sizes.get("Vermelho 1"), 5, f"V1 should have 5 with {total} players")
        self.assertEqual(sizes.get("Preto 1"), 5, f"P1 should have 5 with {total} players")
        self.assertEqual(
            sum(sizes.values()),
            total,
            f"Total should equal {total}",
        )

    def test_ten_players_v1_p1_have_five(self):
        self._assert_v1_p1_have_five(10)

    def test_eleven_players_v1_p1_have_five(self):
        self._assert_v1_p1_have_five(11)

    def test_twelve_players_v1_p1_have_five(self):
        self._assert_v1_p1_have_five(12)

    def test_fifteen_players_v1_p1_have_five(self):
        self._assert_v1_p1_have_five(15)

    def test_nineteen_players_v1_p1_have_five(self):
        self._assert_v1_p1_have_five(19)

    def test_twenty_players_all_subteams_have_five(self):
        players = self._make_players(20)
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-05-07")
        sizes = self._subteam_sizes(division)
        self.assertEqual(sizes.get("Vermelho 1"), 5)
        self.assertEqual(sizes.get("Vermelho 2"), 5)
        self.assertEqual(sizes.get("Preto 1"), 5)
        self.assertEqual(sizes.get("Preto 2"), 5)

    def test_eight_players_balanced_naturally(self):
        """With < 10 players, sizes are balanced naturally (no V1/P1=5 rule)."""
        players = self._make_players(8)
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-05-07")
        sizes = self._subteam_sizes(division)
        self.assertEqual(sum(sizes.values()), 8)
        # Each subteam should have 2 players (8 / 4)
        for size in sizes.values():
            self.assertEqual(size, 2)

    def test_nine_players_max_size_diff_one(self):
        """With 9 players, sizes should be split with max diff of 1."""
        players = self._make_players(9)
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-05-07")
        sizes = self._subteam_sizes(division)
        self.assertEqual(sum(sizes.values()), 9)
        self.assertLessEqual(max(sizes.values()) - min(sizes.values()), 1)


class CenterBalanceTestMixin:
    """Shared helpers for center distribution tests."""

    def _create_player(self, name, quality=3, position="guard", height_cm=180):
        return Player.objects.create(
            name=name,
            quality=quality,
            position=position,
            height_cm=height_cm,
            organization=self.org,
            is_approved=True,
        )

    def _center_counts(self, division):
        return {
            team.name: sum(
                1
                for tp in team.team_players.select_related("player")
                if tp.player.position == "center"
            )
            for team in division.teams.all()
        }


class TwoTeamCenterBalanceTest(CenterBalanceTestMixin, TestCase):
    """Centers must be split evenly (diff <= 1) between the 2 teams."""

    def setUp(self):
        self.org = Organization.objects.create(name="Org 2T Centers")
        self.user = User.objects.create_user(
            username="centers2t",
            email="centers2t@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def test_four_centers_split_two_two(self):
        """Mixed heights/qualities so the tall-center pre-assignment does not apply."""
        players = [
            self._create_player("C1", quality=5, position="center", height_cm=195),
            self._create_player("C2", quality=4, position="center", height_cm=180),
            self._create_player("C3", quality=3, position="center", height_cm=192),
            self._create_player("C4", quality=2, position="center", height_cm=180),
            self._create_player("G1", quality=5, position="guard", height_cm=175),
            self._create_player("G2", quality=3, position="guard", height_cm=175),
            self._create_player("G3", quality=1, position="guard", height_cm=175),
            self._create_player("F1", quality=4, position="forward", height_cm=183),
            self._create_player("F2", quality=3, position="forward", height_cm=183),
            self._create_player("F3", quality=2, position="forward", height_cm=183),
        ]
        division = create_division(self.user, [p.id for p in players], "2_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [2, 2])

    def test_five_centers_split_three_two(self):
        players = (
            [
                self._create_player(f"C{i}", quality=q, position="center", height_cm=h)
                for i, (q, h) in enumerate([(5, 195), (4, 180), (3, 192), (2, 180), (1, 190)])
            ]
            + [
                self._create_player(f"G{i}", quality=q, position="guard", height_cm=175)
                for i, q in enumerate([5, 4, 3])
            ]
            + [
                self._create_player(f"F{i}", quality=q, position="forward", height_cm=183)
                for i, q in enumerate([4, 2, 1])
            ]
        )
        division = create_division(self.user, [p.id for p in players], "2_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [2, 3])

    def test_no_centers_still_works(self):
        players = [
            self._create_player(f"G{i}", quality=(i % 5) + 1, position="guard") for i in range(4)
        ] + [
            self._create_player(f"F{i}", quality=(i % 5) + 1, position="forward") for i in range(4)
        ]
        division = create_division(self.user, [p.id for p in players], "2_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [0, 0])

    def test_all_centers_split_evenly(self):
        players = [
            self._create_player(f"C{i}", quality=(i % 5) + 1, position="center", height_cm=190)
            for i in range(8)
        ]
        division = create_division(self.user, [p.id for p in players], "2_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [4, 4])
        sizes = sorted(team.team_players.count() for team in division.teams.all())
        self.assertEqual(sizes, [4, 4])

    def test_tall_center_pre_assignment_compatible(self):
        """A pre-assigned tall pair plus a third center must still split [1, 2]."""
        players = [
            self._create_player("Tall A", quality=5, position="center", height_cm=200),
            self._create_player("Tall B", quality=5, position="center", height_cm=198),
            self._create_player("Mid C", quality=3, position="center", height_cm=182),
            self._create_player("G1", quality=4, position="guard", height_cm=175),
            self._create_player("G2", quality=3, position="guard", height_cm=175),
            self._create_player("F1", quality=4, position="forward", height_cm=183),
            self._create_player("F2", quality=2, position="forward", height_cm=183),
            self._create_player("F3", quality=1, position="forward", height_cm=183),
        ]
        division = create_division(self.user, [p.id for p in players], "2_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [1, 2])


class FourTeamCenterBalanceTest(CenterBalanceTestMixin, TestCase):
    """Centers must be split evenly between groups and between subteams."""

    def setUp(self):
        self.org = Organization.objects.create(name="Org 4T Centers")
        self.user = User.objects.create_user(
            username="centers4t",
            email="centers4t@test.com",
            password="Test@1234",
            organization=self.org,
        )

    def _group_center_counts(self, division):
        groups = {}
        for team in division.teams.all():
            centers = sum(
                1
                for tp in team.team_players.select_related("player")
                if tp.player.position == "center"
            )
            groups[team.group] = groups.get(team.group, 0) + centers
        return groups

    def _group_qualities(self, division):
        groups = {}
        for team in division.teams.all():
            quality = sum(tp.player.quality for tp in team.team_players.select_related("player"))
            groups[team.group] = groups.get(team.group, 0) + quality
        return groups

    def _production_roster(self):
        """
        15 players with 4 tall centers — mirrors the real division that went 3x1.

        This exact roster reproduces the bug on the pre-fix algorithm: groups
        split centers 3/1 and the V2xP2 matchup got 2 centers vs 0.
        """
        centers = [
            self._create_player(f"C{i}", quality=q, position="center", height_cm=h)
            for i, (q, h) in enumerate([(5, 195), (5, 193), (5, 190), (3, 192)])
        ]
        guards = [
            self._create_player(f"G{i}", quality=q, position="guard", height_cm=175)
            for i, q in enumerate([5, 5, 2, 1])
        ]
        forwards = [
            self._create_player(f"F{i}", quality=q, position="forward", height_cm=183)
            for i, q in enumerate([4, 4, 3, 3, 2, 2, 1])
        ]
        return centers + guards + forwards

    def test_regression_fifteen_players_four_centers(self):
        """Production regression: groups must get 2 centers each, never 3x1."""
        players = self._production_roster()
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-06-12")

        group_centers = self._group_center_counts(division)
        self.assertEqual(group_centers.get("vermelho"), 2)
        self.assertEqual(group_centers.get("preto"), 2)

        counts = self._center_counts(division)
        for name in ["Vermelho 1", "Vermelho 2", "Preto 1", "Preto 2"]:
            self.assertEqual(counts.get(name), 1, f"{name} should have exactly 1 center")

        sizes = {t.name: t.team_players.count() for t in division.teams.all()}
        self.assertEqual(sizes.get("Vermelho 1"), 5)
        self.assertEqual(sizes.get("Preto 1"), 5)
        self.assertEqual(sizes.get("Vermelho 2"), 3)
        self.assertEqual(sizes.get("Preto 2"), 2)

        qualities = self._group_qualities(division)
        self.assertLessEqual(abs(qualities["vermelho"] - qualities["preto"]), 3)

    def test_odd_centers_groups_within_one(self):
        players = (
            [
                self._create_player(f"C{i}", quality=q, position="center", height_cm=h)
                for i, (q, h) in enumerate([(5, 195), (4, 193), (3, 190), (2, 192), (1, 180)])
            ]
            + [
                self._create_player(f"G{i}", quality=q, position="guard", height_cm=175)
                for i, q in enumerate([5, 4, 3, 2, 1])
            ]
            + [
                self._create_player(f"F{i}", quality=q, position="forward", height_cm=183)
                for i, q in enumerate([5, 4, 3, 2, 1])
            ]
        )
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-06-12")

        group_centers = self._group_center_counts(division)
        self.assertEqual(sorted(group_centers.values()), [2, 3])

        counts = self._center_counts(division)
        for group in ["Vermelho", "Preto"]:
            sub1 = counts.get(f"{group} 1", 0)
            sub2 = counts.get(f"{group} 2", 0)
            self.assertLessEqual(abs(sub1 - sub2), 1, f"{group} subteams differ by more than 1")

    def test_many_centers_cap_conflict(self):
        """12 players / 8 centers with sub sizes (5,1,5,1): best split the caps allow."""
        players = [
            self._create_player(f"C{i}", quality=(i % 5) + 1, position="center", height_cm=190)
            for i in range(8)
        ] + [
            self._create_player(f"G{i}", quality=(i % 5) + 1, position="guard", height_cm=175)
            for i in range(4)
        ]
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-06-12")

        group_centers = self._group_center_counts(division)
        self.assertEqual(sorted(group_centers.values()), [4, 4])

        counts = self._center_counts(division)
        for name in ["Vermelho 2", "Preto 2"]:
            self.assertEqual(counts.get(name), 1, f"{name} (size 1) should hold 1 center")
        for name in ["Vermelho 1", "Preto 1"]:
            self.assertEqual(counts.get(name), 3, f"{name} should hold the other 3 centers")

    def test_no_centers_four_teams(self):
        players = [
            self._create_player(f"G{i}", quality=(i % 5) + 1, position="guard") for i in range(6)
        ] + [
            self._create_player(f"F{i}", quality=(i % 5) + 1, position="forward") for i in range(6)
        ]
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [0, 0, 0, 0])
        total = sum(t.team_players.count() for t in division.teams.all())
        self.assertEqual(total, 12)

    def test_all_centers_eight_players(self):
        players = [
            self._create_player(f"C{i}", quality=(i % 5) + 1, position="center", height_cm=190)
            for i in range(8)
        ]
        division = create_division(self.user, [p.id for p in players], "4_teams", "2026-06-12")
        counts = self._center_counts(division)
        self.assertEqual(sorted(counts.values()), [2, 2, 2, 2])


class MatchupQualityBalanceTest(TestCase):
    """The post-pass narrows the quality gap of the V1xP1 and V2xP2 matchups."""

    @staticmethod
    def _profile(player_id, quality, position="guard"):
        height = 190.0 if position == "center" else 180.0
        category = "tall" if position == "center" else "medium"
        return PlayerProfile(player_id, quality, position, category, height)

    @staticmethod
    def _matchup_gap(teams):
        v1, v2, p1, p2 = teams
        return abs(v1.total_quality - p1.total_quality) + abs(v2.total_quality - p2.total_quality)

    def test_swaps_reduce_matchup_gap_preserving_sizes_and_centers(self):
        v1 = TeamSlot(
            name="Vermelho 1",
            group="vermelho",
            players=[
                self._profile("vg1", 5),
                self._profile("vg2", 5),
                self._profile("vc1", 4, "center"),
            ],
        )
        v2 = TeamSlot(
            name="Vermelho 2",
            group="vermelho",
            players=[self._profile("vg3", 1), self._profile("vc2", 1, "center")],
        )
        p1 = TeamSlot(
            name="Preto 1",
            group="preto",
            players=[
                self._profile("pg1", 2),
                self._profile("pg2", 2),
                self._profile("pc1", 2, "center"),
            ],
        )
        p2 = TeamSlot(
            name="Preto 2",
            group="preto",
            players=[self._profile("pg3", 4), self._profile("pc2", 4, "center")],
        )
        teams = [v1, v2, p1, p2]
        gap_before = self._matchup_gap(teams)

        _balance_matchup_quality(teams)

        gap_after = self._matchup_gap(teams)
        self.assertLess(gap_after, gap_before)
        self.assertLessEqual(gap_after, 2)
        self.assertEqual([len(t.players) for t in teams], [3, 2, 3, 2])
        for team in teams:
            centers = sum(1 for p in team.players if p.position == "center")
            self.assertEqual(centers, 1, f"{team.name} center count changed")
        group_v = v1.total_quality + v2.total_quality
        group_p = p1.total_quality + p2.total_quality
        self.assertEqual(group_v, 16)
        self.assertEqual(group_p, 14)

    def test_service_division_has_balanced_matchups(self):
        org = Organization.objects.create(name="Org Matchup")
        user = User.objects.create_user(
            username="matchup",
            email="matchup@test.com",
            password="Test@1234",
            organization=org,
        )

        def create(name, quality, position, height_cm):
            return Player.objects.create(
                name=name,
                quality=quality,
                position=position,
                height_cm=height_cm,
                organization=org,
                is_approved=True,
            )

        players = (
            [create(f"C{i}", q, "center", 192) for i, q in enumerate([5, 4, 2, 1])]
            + [create(f"G{i}", q, "guard", 175) for i, q in enumerate([5, 5, 4, 2, 1])]
            + [create(f"F{i}", q, "forward", 183) for i, q in enumerate([5, 3, 3, 2, 1])]
        )
        division = create_division(user, [p.id for p in players], "4_teams", "2026-06-12")

        qualities = {
            team.name: sum(tp.player.quality for tp in team.team_players.select_related("player"))
            for team in division.teams.all()
        }
        self.assertLessEqual(abs(qualities["Vermelho 1"] - qualities["Preto 1"]), 3)
        self.assertLessEqual(abs(qualities["Vermelho 2"] - qualities["Preto 2"]), 3)


class DivisionVarietyTest(TestCase):
    """The optional rng varies tie-breaks while keeping every balance invariant."""

    @staticmethod
    def _profile(player_id, quality, position, category="medium", height_cm=180.0):
        return PlayerProfile(player_id, quality, position, category, height_cm)

    def _fifteen_with_four_centers(self):
        profiles = [
            self._profile(f"c{i}", q, "center", "tall", 190.0 + i)
            for i, q in enumerate([5, 5, 5, 3])
        ]
        profiles += [
            self._profile(f"g{i}", q, "guard", "small", 175.0) for i, q in enumerate([5, 5, 2, 1])
        ]
        profiles += [
            self._profile(f"f{i}", q, "forward", "medium", 183.0)
            for i, q in enumerate([4, 4, 3, 3, 2, 2, 1])
        ]
        return profiles

    def test_seeded_rng_preserves_invariants(self):
        profiles = self._fifteen_with_four_centers()
        for seed in range(10):
            teams = divide_teams(profiles, "4_teams", rng=random.Random(seed))
            by_name = {t.name: t for t in teams}
            self.assertEqual(len(by_name["Vermelho 1"].players), 5, f"seed {seed}")
            self.assertEqual(len(by_name["Vermelho 2"].players), 3, f"seed {seed}")
            self.assertEqual(len(by_name["Preto 1"].players), 5, f"seed {seed}")
            self.assertEqual(len(by_name["Preto 2"].players), 2, f"seed {seed}")
            for name, team in by_name.items():
                centers = sum(1 for p in team.players if p.position == "center")
                self.assertEqual(centers, 1, f"seed {seed}: {name} center count")
            gap = abs(by_name["Vermelho 1"].total_quality - by_name["Preto 1"].total_quality) + abs(
                by_name["Vermelho 2"].total_quality - by_name["Preto 2"].total_quality
            )
            self.assertLessEqual(gap, 4, f"seed {seed}: matchup gap too large")

    def test_different_seeds_produce_variation(self):
        profiles = [self._profile(f"p{i}", 3, "guard") for i in range(8)]
        partitions = set()
        for seed in range(10):
            teams = divide_teams(profiles, "2_teams", rng=random.Random(seed))
            partitions.add(frozenset(frozenset(p.player_id for p in t.players) for t in teams))
        self.assertGreater(len(partitions), 1)

    def test_default_is_deterministic(self):
        profiles = self._fifteen_with_four_centers()
        first = divide_teams(profiles, "4_teams")
        second = divide_teams(profiles, "4_teams")
        for team_a, team_b in zip(first, second):
            self.assertEqual(
                [p.player_id for p in team_a.players],
                [p.player_id for p in team_b.players],
            )


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
