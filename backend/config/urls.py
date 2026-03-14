from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/players/", include("apps.players.urls")),
    path("api/v1/divisions/", include("apps.divisions.urls")),
]
