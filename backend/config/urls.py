from django.contrib import admin
from django.urls import include, path

from apps.players.views import PublicOrganizationInfoView, PublicPlayerCreateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/players/", include("apps.players.urls")),
    path("api/v1/divisions/", include("apps.divisions.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    # Public endpoints (no auth)
    path(
        "api/v1/org/<slug:slug>/players/register/",
        PublicPlayerCreateView.as_view(),
        name="public-player-register",
    ),
    path(
        "api/v1/org/<slug:slug>/info/",
        PublicOrganizationInfoView.as_view(),
        name="public-org-info",
    ),
]
