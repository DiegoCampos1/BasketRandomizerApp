from rest_framework import viewsets

from core.mixins import OrganizationQuerySetMixin

from .models import Player
from .serializers import PlayerSerializer


class PlayerViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    search_fields = ["name"]
    filterset_fields = ["position", "active"]
    ordering_fields = ["name", "quality", "height_cm", "created_at"]
