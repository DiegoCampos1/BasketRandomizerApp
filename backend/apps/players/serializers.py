from rest_framework import serializers

from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    height_category = serializers.CharField(read_only=True)

    class Meta:
        model = Player
        fields = [
            "id",
            "name",
            "height_cm",
            "height_category",
            "position",
            "quality",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "height_category", "created_at", "updated_at"]

    def validate_quality(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Qualidade deve ser entre 1 e 5.")
        return value

    def validate_height_cm(self, value):
        if value < 100 or value > 250:
            raise serializers.ValidationError("Altura deve ser entre 100 e 250 cm.")
        return value
