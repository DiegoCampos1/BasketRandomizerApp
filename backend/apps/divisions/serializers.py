from rest_framework import serializers

from apps.players.serializers import PlayerSerializer

from .models import Division, Team, TeamPlayer


class TeamPlayerSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)

    class Meta:
        model = TeamPlayer
        fields = ["id", "player", "order"]


class TeamSerializer(serializers.ModelSerializer):
    team_players = TeamPlayerSerializer(many=True, read_only=True)
    total_quality = serializers.SerializerMethodField()
    player_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ["id", "name", "group", "team_players", "total_quality", "player_count"]

    def get_total_quality(self, obj):
        return sum(tp.player.quality for tp in obj.team_players.select_related("player").all())

    def get_player_count(self, obj):
        return obj.team_players.count()


class DivisionListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    team_count = serializers.SerializerMethodField()
    player_count = serializers.SerializerMethodField()

    class Meta:
        model = Division
        fields = [
            "id",
            "date",
            "mode",
            "created_by_name",
            "team_count",
            "player_count",
            "created_at",
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.first_name or obj.created_by.email

    def get_team_count(self, obj):
        return obj.teams.count()

    def get_player_count(self, obj):
        return TeamPlayer.objects.filter(team__division=obj).count()


class DivisionDetailSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Division
        fields = ["id", "date", "mode", "created_by_name", "teams", "created_at"]

    def get_created_by_name(self, obj):
        return obj.created_by.first_name or obj.created_by.email


class DivisionCreateSerializer(serializers.Serializer):
    player_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=4,
        max_length=20,
    )
    mode = serializers.ChoiceField(choices=Division.Mode.choices)
    date = serializers.DateField()

    def validate(self, data):
        mode = data["mode"]
        player_count = len(data["player_ids"])

        if mode == "2_teams" and player_count < 4:
            raise serializers.ValidationError("Mínimo de 4 jogadores para 2 times.")
        if mode == "4_teams" and player_count < 8:
            raise serializers.ValidationError("Mínimo de 8 jogadores para 4 times.")

        if player_count > 20:
            raise serializers.ValidationError("Máximo de 20 jogadores por divisão.")

        if len(set(data["player_ids"])) != player_count:
            raise serializers.ValidationError("Jogadores duplicados na lista.")

        return data


class SwapPlayersSerializer(serializers.Serializer):
    player_a_id = serializers.UUIDField()
    player_b_id = serializers.UUIDField()

    def validate(self, data):
        if data["player_a_id"] == data["player_b_id"]:
            raise serializers.ValidationError("Selecione dois jogadores diferentes.")
        return data


class MovePlayerSerializer(serializers.Serializer):
    team_player_id = serializers.UUIDField()
    target_team_id = serializers.UUIDField()
