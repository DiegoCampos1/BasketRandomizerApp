from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.mixins import OrganizationQuerySetMixin

from .models import Division
from .serializers import (
    DivisionCreateSerializer,
    DivisionDetailSerializer,
    DivisionListSerializer,
    SwapPlayersSerializer,
)
from .services import create_division, swap_players


class DivisionViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = Division.objects.prefetch_related(
        "teams__team_players__player"
    ).all()
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return DivisionCreateSerializer
        if self.action == "list":
            return DivisionListSerializer
        return DivisionDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            division = create_division(
                user=request.user,
                player_ids=serializer.validated_data["player_ids"],
                mode=serializer.validated_data["mode"],
                date=serializer.validated_data["date"],
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        output = DivisionDetailSerializer(division)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="swap")
    def swap(self, request, pk=None):
        division = self.get_object()
        serializer = SwapPlayersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            swap_players(
                division_id=division.id,
                player_a_id=serializer.validated_data["player_a_id"],
                player_b_id=serializer.validated_data["player_b_id"],
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        division.refresh_from_db()
        output = DivisionDetailSerializer(division)
        return Response(output.data)
