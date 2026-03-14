from django_filters import rest_framework as filters

from .models import Player


class PlayerFilter(filters.FilterSet):
    min_quality = filters.NumberFilter(field_name="quality", lookup_expr="gte")
    max_quality = filters.NumberFilter(field_name="quality", lookup_expr="lte")
    position = filters.CharFilter(field_name="position")

    class Meta:
        model = Player
        fields = ["position", "active", "min_quality", "max_quality"]
