"""
Algoritmo de divisão de times para pelada de basquete.

Utiliza Serpentine Draft com balanceamento multi-fator:
- Qualidade (peso 3.0)
- Posição (peso 1.5)
- Altura (peso 1.0)
"""

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


def _serpentine_draft(players: list[PlayerProfile], teams: list[TeamSlot]):
    """Perform serpentine draft with cost-based team assignment."""

    # Sort by quality descending, with scarcity bonus for centers and tall players
    def sort_key(p):
        scarcity = 0
        if p.position == "center":
            scarcity += 0.5
        if p.height_category == "tall":
            scarcity += 0.3
        return -(p.quality + scarcity)

    players_sorted = sorted(players, key=sort_key)

    num_teams = len(teams)
    forward = True

    for i, player in enumerate(players_sorted):
        # Determine draft order for this round
        if forward:
            team_order = list(range(num_teams))
        else:
            team_order = list(range(num_teams - 1, -1, -1))

        # Find the best team for this player based on cost
        best_team = None
        best_cost = float("inf")

        for team_idx in team_order:
            team = teams[team_idx]
            cost = _compute_placement_cost(team, player, teams)
            if cost < best_cost:
                best_cost = cost
                best_team = team

        best_team.players.append(player)

        # Flip direction every round
        if (i + 1) % num_teams == 0:
            forward = not forward


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
    Step 1: Divide into 2 groups (Vermelho/Preto)
    Step 2: Subdivide each group into 2 subteams
    """
    # Step 1: Divide into 2 groups
    group_vermelho = TeamSlot(name="Grupo Vermelho", group="vermelho")
    group_preto = TeamSlot(name="Grupo Preto", group="preto")
    groups = [group_vermelho, group_preto]

    remaining = _pre_assign_tall_centers(players, groups)
    _serpentine_draft(remaining, groups)

    # Step 2: Subdivide each group
    final_teams = []

    for group in groups:
        sub1 = TeamSlot(name=f"{group.group.capitalize()} 1", group=group.group)
        sub2 = TeamSlot(name=f"{group.group.capitalize()} 2", group=group.group)
        sub_teams = [sub1, sub2]

        group_players = list(group.players)
        group.players.clear()

        remaining_sub = _pre_assign_tall_centers(group_players, sub_teams)
        _serpentine_draft(remaining_sub, sub_teams)

        # Garantir que o time 1 tenha mais jogadores (ou igual) que o time 2
        if len(sub2.players) > len(sub1.players):
            sub1.players, sub2.players = sub2.players, sub1.players

        final_teams.extend(sub_teams)

    return final_teams


def divide_teams(players: list[PlayerProfile], mode: str) -> list[TeamSlot]:
    """
    Main entry point for team division.

    Args:
        players: List of PlayerProfile objects
        mode: "2_teams" or "4_teams"

    Returns:
        List of TeamSlot objects with assigned players
    """
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
