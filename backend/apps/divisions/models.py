import uuid

from django.db import models


class Division(models.Model):
    class Mode(models.TextChoices):
        TWO_TEAMS = "2_teams", "2 Times"
        FOUR_TEAMS = "4_teams", "4 Times"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="divisions",
    )
    mode = models.CharField(max_length=10, choices=Mode.choices)
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="divisions_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"Divisão {self.date} ({self.get_mode_display()})"


class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=100)
    group = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        ordering = ["group", "name"]

    def __str__(self):
        return self.name


class TeamPlayer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="team_players")
    player = models.ForeignKey("players.Player", on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [("team", "player")]
        ordering = ["order"]

    def __str__(self):
        return f"{self.player.name} - {self.team.name}"
