from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Organization

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "created_at", "members_count"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_members_count(self, obj):
        return obj.members.count()


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "organization"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    organization_name = serializers.CharField(max_length=255, required=False)
    organization_id = serializers.UUIDField(required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já cadastrado.")
        return value

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Senhas não coincidem."})

        has_org_name = bool(data.get("organization_name"))
        has_org_id = bool(data.get("organization_id"))

        if not has_org_name and not has_org_id:
            raise serializers.ValidationError(
                "Informe organization_name para criar ou organization_id para entrar."
            )
        if has_org_name and has_org_id:
            raise serializers.ValidationError(
                "Informe apenas organization_name ou organization_id, não ambos."
            )

        if has_org_id:
            try:
                Organization.objects.get(id=data["organization_id"])
            except Organization.DoesNotExist:
                raise serializers.ValidationError(
                    {"organization_id": "Organização não encontrada."}
                )

        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        org_name = validated_data.pop("organization_name", None)
        org_id = validated_data.pop("organization_id", None)
        name = validated_data.pop("name")

        if org_name:
            organization = Organization.objects.create(name=org_name)
        else:
            organization = Organization.objects.get(id=org_id)

        # Auto-generate username from email prefix to satisfy AbstractUser
        email = validated_data["email"]
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            first_name=name,
            organization=organization,
        )
        return user
