# Generated by Django 5.1.7 on 2025-05-02 21:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0002_alter_blog_options_alter_blog_author_access_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blog',
            name='authenticated_access',
            field=models.CharField(choices=[('Read & Write', 'Read & Write'), ('Read Only', 'Read Only'), ('None', 'None')], default='Read Only', max_length=12),
        ),
        migrations.AlterField(
            model_name='blog',
            name='author_access',
            field=models.CharField(choices=[('Read & Write', 'Read & Write'), ('Read Only', 'Read Only')], default='Read & Write', max_length=12),
        ),
        migrations.AlterField(
            model_name='blog',
            name='public_access',
            field=models.CharField(choices=[('Read Only', 'Read Only'), ('None', 'None')], default='Read Only', max_length=12),
        ),
        migrations.AlterField(
            model_name='blog',
            name='team_access',
            field=models.CharField(choices=[('Read & Write', 'Read & Write'), ('Read Only', 'Read Only'), ('None', 'None')], default='Read Only', max_length=12),
        ),
    ]
