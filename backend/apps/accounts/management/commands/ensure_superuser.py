import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from environment variables if one does not exist."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not email or not password:
            self.stdout.write(
                self.style.NOTICE(
                    "DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD not set. Skipping."
                )
            )
            return

        User = get_user_model()

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.SUCCESS(f"Superuser {email} already exists.")
            )
            return

        User.objects.create_superuser(
            username=email,
            email=email,
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS(f"Superuser {email} created successfully.")
        )
