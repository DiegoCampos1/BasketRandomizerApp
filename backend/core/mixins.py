class OrganizationQuerySetMixin:
    """Automatically scopes querysets and creation to the user's organization."""

    organization_field = "organization"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(**{self.organization_field: self.request.user.organization})

    def perform_create(self, serializer):
        serializer.save(**{self.organization_field: self.request.user.organization})
