from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Organization, User


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "organization", "is_staff"]
    list_filter = ["organization", "is_staff", "is_active"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Organização", {"fields": ("organization",)}),
    )
