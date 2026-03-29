import uuid

from django.db import models


class Player(models.Model):
    class Position(models.TextChoices):
        GUARD = "guard", "Guard"
        FORWARD = "forward", "Forward"
        CENTER = "center", "Center"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    height_cm = models.FloatField(help_text="Altura em centímetros")
    position = models.CharField(max_length=10, choices=Position.choices)
    quality = models.IntegerField(
        help_text="Qualidade do jogador de 1 a 5",
        default=0,
    )
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="players",
    )
    active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"

    @property
    def height_category(self) -> str:
        if self.height_cm <= 176:
            return "small"
        elif self.height_cm <= 187:
            return "medium"
        else:
            return "tall"
