from django.db import transaction

from apps.players.models import Player

from .algorithm import PlayerProfile, divide_teams
from .models import Division, Team, TeamPlayer


def create_division(user, player_ids, mode, date):
    """
    Create a division by running the balancing algorithm.

    Args:
        user: The authenticated user
        player_ids: List of player UUIDs
        mode: "2_teams" or "4_teams"
        date: Date of the division

    Returns:
        Division instance with teams and players created
    """
    players = Player.objects.filter(
        id__in=player_ids,
        organization=user.organization,
        active=True,
    )

    if players.count() != len(player_ids):
        raise ValueError("Alguns jogadores não foram encontrados ou não estão ativos.")

    # Convert to PlayerProfile for algorithm
    profiles = [
        PlayerProfile(
            player_id=str(p.id),
            quality=p.quality,
            position=p.position,
            height_category=p.height_category,
            height_cm=p.height_cm,
        )
        for p in players
    ]

    # Run algorithm
    team_slots = divide_teams(profiles, mode)

    # Persist in database
    with transaction.atomic():
        division = Division.objects.create(
            date=date,
            organization=user.organization,
            mode=mode,
            created_by=user,
        )

        for slot in team_slots:
            team = Team.objects.create(
                division=division,
                name=slot.name,
                group=slot.group,
            )
            for order, profile in enumerate(slot.players):
                TeamPlayer.objects.create(
                    team=team,
                    player_id=profile.player_id,
                    order=order,
                )

    return division


def swap_players(division_id, player_a_id, player_b_id):
    """
    Swap two players between teams within the same division.
    """
    with transaction.atomic():
        tp_a = TeamPlayer.objects.select_related("team__division").get(
            team__division_id=division_id,
            player_id=player_a_id,
        )
        tp_b = TeamPlayer.objects.select_related("team__division").get(
            team__division_id=division_id,
            player_id=player_b_id,
        )

        if tp_a.team_id == tp_b.team_id:
            raise ValueError("Jogadores já estão no mesmo time.")

        # Swap teams
        tp_a.team, tp_b.team = tp_b.team, tp_a.team
        tp_a.save(update_fields=["team"])
        tp_b.save(update_fields=["team"])

    return tp_a.team.division
