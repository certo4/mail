# Generated by Django 3.1.6 on 2021-03-28 22:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0002_auto_20210328_2223'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='subject',
            field=models.CharField(max_length=255),
        ),
    ]
