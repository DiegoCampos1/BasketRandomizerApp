from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Organization, User


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "first_name", "organization", "is_staff"]
    list_filter = ["organization", "is_staff", "is_active"]
    ordering = ["email"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informações pessoais", {"fields": ("first_name", "last_name")}),
        ("Organização", {"fields": ("organization",)}),
        (
            "Permissões",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Datas", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "password1", "password2", "organization"),
            },
        ),
    )
    search_fields = ["email", "first_name"]
