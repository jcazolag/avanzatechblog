from django.db import models
from user.models import User
from .data.choices import ACCESS_CHOICES, PUBLIC_CHOICES, AUTHOR_CHOICES
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

# Create your models here.


class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(_("title"), max_length=50)
    content = models.TextField(_('content'))
    excerpt = models.CharField(max_length=200, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    author_access = models.CharField(max_length=12, choices=AUTHOR_CHOICES, default='Read & Write')
    team_access = models.CharField(max_length=12, choices=ACCESS_CHOICES, default='Read Only')
    authenticated_access = models.CharField(max_length=12, choices=ACCESS_CHOICES, default='Read Only')
    public_access = models.CharField(max_length=12, choices=PUBLIC_CHOICES, default='Read Only')

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return self.title

    def clean(self):
        if self.author.is_staff or self.author.team.title == 'admin' or self.author.role.title == 'admin':
            raise ValidationError("Administrators cannot be assigned as authors.")
    
    def validate_access_fields(self):
            ACCESS = ['None', 'Read Only', 'Read & Write']
            default = 'Read Only'
            if self.public_access not in ACCESS:
                self.public_access = default
            if self.authenticated_access not in ACCESS:
                self.authenticated_access = default
            if self.team_access not in ACCESS:
                self.team_access = default
            if self.author_access not in ACCESS:
                self.author_access = default

    def save(self, *args, **kwargs):
        self.clean()

        ACCESS_HIERARCHY = ['None', 'Read Only', 'Read & Write']

        def adjust_permissions():
            if self.author_access == 'None':
                self.author_access = 'Read Only'

            if ACCESS_HIERARCHY.index(self.public_access) > ACCESS_HIERARCHY.index('Read Only'):
                self.public_access = 'Read Only'

            if ACCESS_HIERARCHY.index(self.author_access) < ACCESS_HIERARCHY.index(self.team_access):
                self.team_access = self.author_access
            if ACCESS_HIERARCHY.index(self.author_access) < ACCESS_HIERARCHY.index(self.authenticated_access):
                self.authenticated_access = self.author_access
            if ACCESS_HIERARCHY.index(self.author_access) < ACCESS_HIERARCHY.index(self.public_access):
                self.public_access = self.author_access

            if ACCESS_HIERARCHY.index(self.team_access) < ACCESS_HIERARCHY.index(self.authenticated_access):
                self.authenticated_access = self.team_access
            if ACCESS_HIERARCHY.index(self.team_access) < ACCESS_HIERARCHY.index(self.public_access):
                self.public_access = self.team_access

            if ACCESS_HIERARCHY.index(self.authenticated_access) < ACCESS_HIERARCHY.index(self.public_access):
                self.public_access = self.authenticated_access

        # Ajustar los permisos antes de guardar
        self.validate_access_fields()
        adjust_permissions()

        if self.content:
            self.excerpt = self.content[:200]

        super().save(*args, **kwargs)

