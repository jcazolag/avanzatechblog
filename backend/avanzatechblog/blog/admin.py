from django.contrib import admin
from .models import Blog

# Register your models here.

class BlogAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'title', 'timestamp', 'author_access', 'team_access', 'authenticated_access', 'public_access')
    list_filter = ['author']

admin.site.register(Blog, BlogAdmin)