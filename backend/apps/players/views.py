from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import Organization
from core.mixins import OrganizationQuerySetMixin

from .models import Player
from .serializers import ApprovePlayerSerializer, PlayerSerializer, PublicPlayerSerializer


class PlayerViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    search_fields = ["name"]
    filterset_fields = ["position", "active", "is_approved"]
    ordering_fields = ["name", "quality", "height_cm", "created_at"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        player = self.get_object()

        if player.is_approved:
            return Response(
                {"detail": "Jogador já está aprovado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ApprovePlayerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        player.quality = serializer.validated_data["quality"]
        player.is_approved = True
        player.save(update_fields=["quality", "is_approved", "updated_at"])

        # Create notification for approval
        from apps.notifications.models import Notification

        Notification.objects.filter(
            related_player=player,
            type="player_pending",
            is_read=False,
        ).update(is_read=True)

        return Response(PlayerSerializer(player).data)


class PublicPlayerCreateView(generics.CreateAPIView):
    """Public endpoint for player self-registration (no auth required)."""

    serializer_class = PublicPlayerSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        slug = self.kwargs["slug"]

        try:
            organization = Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organização não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        player = Player.objects.create(
            name=serializer.validated_data["name"],
            height_cm=serializer.validated_data["height_cm"],
            position=serializer.validated_data["position"],
            quality=0,
            organization=organization,
            is_approved=False,
        )

        # Create notifications for all org members
        from apps.notifications.models import Notification

        members = organization.members.all()
        notifications = [
            Notification(
                organization=organization,
                user=member,
                type="player_pending",
                title="Novo jogador pendente",
                message=f'O jogador "{player.name}" espera sua aprovação',
                related_player=player,
            )
            for member in members
        ]
        Notification.objects.bulk_create(notifications)

        return Response(
            {"detail": "Cadastro enviado! Aguarde a aprovação do administrador."},
            status=status.HTTP_201_CREATED,
        )


class PublicOrganizationInfoView(generics.RetrieveAPIView):
    """Public endpoint to get organization name by slug."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        slug = self.kwargs["slug"]
        try:
            org = Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organização não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"name": org.name, "slug": org.slug})
