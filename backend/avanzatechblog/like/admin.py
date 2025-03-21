from django.contrib import admin
from .models import Like

# Register your models here.

class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'blog', 'created_at')
    list_filter = ['user', 'blog']

admin.site.register(Like, LikeAdmin)