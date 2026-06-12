"""
Algoritmo de divisão de times para pelada de basquete.

Utiliza Serpentine Draft com balanceamento multi-fator:
- Qualidade (peso 3.0)
- Posição (peso 1.5)
- Altura (peso 1.0)

Regra rígida: pivôs são distribuídos igualitariamente (diferença máxima de 1)
entre os lados em cada nível da divisão. Armadores e alas seguem apenas o
balanceamento por custo.
"""

import random
from dataclasses import dataclass, field

WEIGHT_QUALITY = 3.0
WEIGHT_POSITION = 1.5
WEIGHT_HEIGHT = 1.0


@dataclass
class PlayerProfile:
    player_id: str
    quality: int
    position: str
    height_category: str
    height_cm: float


@dataclass
class TeamSlot:
    name: str
    group: str
    players: list = field(default_factory=list)

    @property
    def total_quality(self):
        return sum(p.quality for p in self.players)

    def count_position(self, position: str) -> int:
        return sum(1 for p in self.players if p.position == position)

    def count_height(self, height_category: str) -> int:
        return sum(1 for p in self.players if p.height_category == height_category)


def _compute_placement_cost(
    team: TeamSlot, player: PlayerProfile, all_teams: list[TeamSlot]
) -> float:
    """Compute the cost of placing a player on a specific team."""
    num_teams = len(all_teams)

    # Quality imbalance: how far this team's quality would be from average
    total_quality_all = sum(t.total_quality for t in all_teams) + player.quality
    avg_quality = total_quality_all / num_teams
    team_quality_after = team.total_quality + player.quality
    quality_cost = abs(team_quality_after - avg_quality)

    # Position imbalance
    avg_position = (sum(t.count_position(player.position) for t in all_teams) + 1) / num_teams
    team_position_after = team.count_position(player.position) + 1
    position_cost = abs(team_position_after - avg_position)

    # Height imbalance
    avg_height = (sum(t.count_height(player.height_category) for t in all_teams) + 1) / num_teams
    team_height_after = team.count_height(player.height_category) + 1
    height_cost = abs(team_height_after - avg_height)

    return (
        WEIGHT_QUALITY * quality_cost
        + WEIGHT_POSITION * position_cost
        + WEIGHT_HEIGHT * height_cost
    )


def _eligible_team_indexes(
    player: PlayerProfile,
    teams: list[TeamSlot],
    target_sizes: list[int] | None = None,
) -> set[int]:
    """
    Indexes of teams this player may be placed on.

    Teams must have room under target_sizes (when given). When the player is a
    center, only the teams with the minimum current center count among those
    with room are eligible, enforcing an even center split (diff <= 1).
    """
    indexes = [
        i
        for i in range(len(teams))
        if target_sizes is None or len(teams[i].players) < target_sizes[i]
    ]
    if indexes and player.position == "center":
        min_centers = min(teams[i].count_position("center") for i in indexes)
        indexes = [i for i in indexes if teams[i].count_position("center") == min_centers]
    return set(indexes)


def _pre_assign_tall_centers(
    players: list[PlayerProfile], teams: list[TeamSlot]
) -> list[PlayerProfile]:
    """
    Pre-assign pairs of tall centers with similar quality to different teams.
    Returns the remaining unassigned players.
    """
    tall_centers = [p for p in players if p.position == "center" and p.height_category == "tall"]
    tall_centers.sort(key=lambda p: p.quality, reverse=True)

    remaining = list(players)
    assigned_count = 0

    for i in range(0, len(tall_centers) - 1, 2):
        p1 = tall_centers[i]
        p2 = tall_centers[i + 1]

        if abs(p1.quality - p2.quality) <= 1:
            # Assign to teams with lowest current quality
            sorted_teams = sorted(teams, key=lambda t: t.total_quality)
            sorted_teams[0].players.append(p1)
            sorted_teams[1].players.append(p2)
            remaining.remove(p1)
            remaining.remove(p2)
            assigned_count += 2

    return remaining


def _draft_sort_key(p: PlayerProfile) -> float:
    """Sort key: best players first, with small scarcity bonus for centers / tall."""
    scarcity = 0.0
    if p.position == "center":
        scarcity += 0.5
    if p.height_category == "tall":
        scarcity += 0.3
    return -(p.quality + scarcity)


def _serpentine_draft(players: list[PlayerProfile], teams: list[TeamSlot]):
    """Perform serpentine draft with cost-based team assignment."""
    players_sorted = sorted(players, key=_draft_sort_key)

    num_teams = len(teams)
    forward = True

    for i, player in enumerate(players_sorted):
        if forward:
            team_order = list(range(num_teams))
        else:
            team_order = list(range(num_teams - 1, -1, -1))

        eligible = _eligible_team_indexes(player, teams)

        best_team = None
        best_cost = float("inf")

        for team_idx in team_order:
            if team_idx not in eligible:
                continue
            team = teams[team_idx]
            cost = _compute_placement_cost(team, player, teams)
            if cost < best_cost:
                best_cost = cost
                best_team = team

        best_team.players.append(player)

        if (i + 1) % num_teams == 0:
            forward = not forward


def _balanced_draft_with_sizes(
    players: list[PlayerProfile],
    teams: list[TeamSlot],
    target_sizes: list[int],
):
    """
    Draft players to teams respecting target_sizes (hard cap per team) while
    minimizing the placement cost (quality, position, height).

    Centers are drafted first so the even center split is as good as the caps
    allow. Players already present in teams (e.g. pre-assigned) count toward
    both the cap and the center counts.
    """
    centers = [p for p in players if p.position == "center"]
    others = [p for p in players if p.position != "center"]
    players_sorted = sorted(centers, key=_draft_sort_key) + sorted(others, key=_draft_sort_key)

    for player in players_sorted:
        eligible = _eligible_team_indexes(player, teams, target_sizes)
        best_team = None
        best_cost = float("inf")
        for idx in sorted(eligible):
            team = teams[idx]
            cost = _compute_placement_cost(team, player, teams)
            if cost < best_cost:
                best_cost = cost
                best_team = team
        # Fallback should not happen if sum(target_sizes) == total players
        if best_team is None:
            best_team = min(teams, key=lambda t: len(t.players))
        best_team.players.append(player)


def _balance_matchup_quality(teams: list[TeamSlot], max_iterations: int = 30) -> None:
    """
    Narrow the quality gap of the matchups V1xP1 and V2xP2 by swapping players
    between the subteams of the same group.

    Swaps are 1-for-1 within a group, so team sizes and group totals stay
    intact. Centers only swap with centers (and non-centers with non-centers),
    preserving the even center split.
    """
    v1, v2, p1, p2 = teams

    def matchup_gap(qv1: int, qv2: int, qp1: int, qp2: int) -> int:
        return abs(qv1 - qp1) + abs(qv2 - qp2)

    for _ in range(max_iterations):
        qv1, qv2 = v1.total_quality, v2.total_quality
        qp1, qp2 = p1.total_quality, p2.total_quality
        best_gap = matchup_gap(qv1, qv2, qp1, qp2)
        best_swap = None

        for sub_a, sub_b in ((v1, v2), (p1, p2)):
            for player_a in sub_a.players:
                for player_b in sub_b.players:
                    if (player_a.position == "center") != (player_b.position == "center"):
                        continue
                    delta = player_b.quality - player_a.quality
                    if sub_a is v1:
                        gap = matchup_gap(qv1 + delta, qv2 - delta, qp1, qp2)
                    else:
                        gap = matchup_gap(qv1, qv2, qp1 + delta, qp2 - delta)
                    if gap < best_gap:
                        best_gap = gap
                        best_swap = (sub_a, player_a, sub_b, player_b)

        if best_swap is None:
            return

        sub_a, player_a, sub_b, player_b = best_swap
        sub_a.players.remove(player_a)
        sub_b.players.remove(player_b)
        sub_a.players.append(player_b)
        sub_b.players.append(player_a)


def _compute_four_team_target_sizes(total: int) -> tuple[list[int], tuple[int, int, int, int]]:
    """
    Compute group and subteam target sizes for 4-team mode.

    Returns:
        ([group_vermelho_size, group_preto_size], (v1, v2, p1, p2))

    Rule: when total >= 10, Vermelho 1 and Preto 1 are guaranteed 5 players each;
    the remainder is split between Vermelho 2 and Preto 2 (max diff 1, V2 takes
    the extra when odd). When total < 10, sizes are balanced naturally.
    """
    if total >= 10:
        rest = total - 10
        v2 = rest // 2 + rest % 2
        p2 = rest // 2
        return ([5 + v2, 5 + p2], (5, v2, 5, p2))

    gv = total // 2 + total % 2
    gp = total // 2
    v1 = gv // 2 + gv % 2
    v2 = gv // 2
    p1 = gp // 2 + gp % 2
    p2 = gp // 2
    return ([gv, gp], (v1, v2, p1, p2))


def divide_two_teams(players: list[PlayerProfile]) -> list[TeamSlot]:
    """Divide players into 2 balanced teams."""
    teams = [
        TeamSlot(name="Time Vermelho", group=""),
        TeamSlot(name="Time Preto", group=""),
    ]

    remaining = _pre_assign_tall_centers(players, teams)
    _serpentine_draft(remaining, teams)

    return teams


def divide_four_teams(players: list[PlayerProfile]) -> list[TeamSlot]:
    """
    Divide players into 4 teams organized as 2 groups of 2.

    Step 1: Divide into 2 groups (Vermelho/Preto) with target sizes.
    Step 2: Subdivide each group into 2 subteams with target sizes.

    With 10+ players, the subteams "1" of each group are guaranteed to have
    exactly 5 players, and the remainder fills the subteams "2".
    """
    n = len(players)
    group_sizes, sub_sizes = _compute_four_team_target_sizes(n)
    v1_size, v2_size, p1_size, p2_size = sub_sizes

    # Step 1: Divide into 2 groups respecting target group sizes.
    group_vermelho = TeamSlot(name="Grupo Vermelho", group="vermelho")
    group_preto = TeamSlot(name="Grupo Preto", group="preto")
    groups = [group_vermelho, group_preto]
    _balanced_draft_with_sizes(list(players), groups, group_sizes)

    # Step 2: Subdivide each group with target subteam sizes.
    final_teams: list[TeamSlot] = []
    sub_targets = [(v1_size, v2_size), (p1_size, p2_size)]

    for group, (sub1_size, sub2_size) in zip(groups, sub_targets):
        sub1 = TeamSlot(name=f"{group.group.capitalize()} 1", group=group.group)
        sub2 = TeamSlot(name=f"{group.group.capitalize()} 2", group=group.group)
        sub_teams = [sub1, sub2]

        group_players = list(group.players)
        group.players.clear()

        _balanced_draft_with_sizes(group_players, sub_teams, [sub1_size, sub2_size])
        final_teams.extend(sub_teams)

    _balance_matchup_quality(final_teams)

    return final_teams


def divide_teams(
    players: list[PlayerProfile],
    mode: str,
    rng: random.Random | None = None,
) -> list[TeamSlot]:
    """
    Main entry point for team division.

    Args:
        players: List of PlayerProfile objects
        mode: "2_teams" or "4_teams"
        rng: Optional random generator. When given, players are shuffled so
            ties between equivalent players vary between runs; all balance
            guarantees are preserved (sorts are stable, placement logic is
            unchanged).

    Returns:
        List of TeamSlot objects with assigned players
    """
    players = list(players)
    if rng is not None:
        rng.shuffle(players)

    if len(players) > 20:
        raise ValueError("Máximo de 20 jogadores por divisão.")

    if mode == "2_teams":
        if len(players) < 4:
            raise ValueError("Mínimo de 4 jogadores para dividir em 2 times.")
        return divide_two_teams(players)
    elif mode == "4_teams":
        if len(players) < 8:
            raise ValueError("Mínimo de 8 jogadores para dividir em 4 times.")
        return divide_four_teams(players)
    else:
        raise ValueError(f"Modo inválido: {mode}")
