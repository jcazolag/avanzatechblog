from django.contrib import admin
from .models import User, Team, Role

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_superuser', 'is_staff', 'team', 'role', 'date_joined', 'last_login', 'is_active')
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'team', 'role']

admin.site.register(User, UserAdmin)

admin.site.register(Team)

admin.site.register(Role)

