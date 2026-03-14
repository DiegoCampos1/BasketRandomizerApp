from django.contrib import admin

from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ["name", "position", "height_cm", "quality", "organization", "active"]
    list_filter = ["position", "organization", "active"]
    search_fields = ["name"]
