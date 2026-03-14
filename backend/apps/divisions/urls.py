from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.DivisionViewSet, basename="division")

urlpatterns = [
    path("", include(router.urls)),
]
