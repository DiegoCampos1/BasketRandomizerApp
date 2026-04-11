import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or promote a superuser from environment variables."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not email or not password:
            self.stdout.write(
                self.style.NOTICE(
                    "DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD "
                    "not set. Skipping."
                )
            )
            return

        User = get_user_model()
        user = User.objects.filter(email=email).first()

        if user:
            changed = False
            if not user.is_staff:
                user.is_staff = True
                changed = True
            if not user.is_superuser:
                user.is_superuser = True
                changed = True
            if changed:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"User {email} promoted to superuser."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Superuser {email} already exists."
                    )
                )
        else:
            User.objects.create_superuser(
                username=email,
                email=email,
                password=password,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser {email} created successfully."
                )
            )
