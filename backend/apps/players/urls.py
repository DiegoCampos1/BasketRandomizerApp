from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.PlayerViewSet, basename="player")

urlpatterns = [
    path("", include(router.urls)),
]
