from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.mixins import OrganizationQuerySetMixin

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch", "post"]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user,
            organization=self.request.user.organization,
        )

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"count": count})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)

        from .services import notify_count_update

        notify_count_update(organization_id=str(request.user.organization_id))

        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])

        from .services import notify_count_update

        notify_count_update(organization_id=str(request.user.organization_id))

        return Response(NotificationSerializer(notification).data)
