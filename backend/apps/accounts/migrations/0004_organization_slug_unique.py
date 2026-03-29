from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_populate_slugs"),
    ]

    operations = [
        migrations.AlterField(
            model_name="organization",
            name="slug",
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
    ]
