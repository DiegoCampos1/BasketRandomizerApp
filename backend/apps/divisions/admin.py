from django.contrib import admin

from .models import Division, Team, TeamPlayer


class TeamPlayerInline(admin.TabularInline):
    model = TeamPlayer
    extra = 0
    readonly_fields = ["player", "order"]


class TeamInline(admin.TabularInline):
    model = Team
    extra = 0
    readonly_fields = ["name", "group"]
    show_change_link = True


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ["date", "mode", "organization", "created_by", "created_at"]
    list_filter = ["mode", "organization"]
    inlines = [TeamInline]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "group", "division"]
    inlines = [TeamPlayerInline]
