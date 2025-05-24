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
        if not self.author:
            raise ValidationError("Blog must have an author.")

        if (
            self.author.is_staff or 
            getattr(self.author.team, 'title', '').lower() == 'admin' or 
            getattr(self.author.role, 'title', '').lower() == 'admin'
        ):
            raise ValidationError("Administrators cannot be assigned as authors.")

    
    def validate_access_fields(self):
            ACCESS = ['None', 'Read Only', 'Read & Write']
            default = 'Read Only'
            for field in ['public_access', 'authenticated_access', 'team_access', 'author_access']:
                value = getattr(self, field)
                if value not in ACCESS:
                    setattr(self, field, default)

    def save(self, *args, **kwargs):
        self.clean()

        def adjust_permissions():
            ACCESS_RANK = {
                'None': 0,
                'Read Only': 1,
                'Read & Write': 2,
            }

            # 1. Si author_access está en 'Read Only', nadie más puede tener 'Read & Write'
            if self.author_access == 'Read Only':
                if ACCESS_RANK.get(self.team_access, 0) == 2:
                    self.team_access = 'Read Only'
                if ACCESS_RANK.get(self.authenticated_access, 0) == 2:
                    self.authenticated_access = 'Read Only'
                if ACCESS_RANK.get(self.public_access, 0) == 2:
                    self.public_access = 'Read Only'

            # 2. Si team_access está en 'Read Only', nadie más que el autor puede tener 'Read & Write'
            if self.team_access == 'Read Only':
                if ACCESS_RANK.get(self.authenticated_access, 0) == 2:
                    self.authenticated_access = 'Read Only'
                if ACCESS_RANK.get(self.public_access, 0) == 2:
                    self.public_access = 'Read Only'

            # 3. Si team_access está en 'None', solo el autor puede tener acceso (visibilidad o escritura)
            if self.team_access == 'None':
                self.authenticated_access = 'None'
                self.public_access = 'None'

            # 4. Si authenticated_access está en 'None', public_access también debe ser 'None'
            if self.authenticated_access == 'None':
                self.public_access = 'None'

            # 5. public_access solo puede ser 'Read Only' o 'None', asegurar esto:
            if self.public_access not in ['Read Only', 'None']:
                self.public_access = 'Read Only'

        # Ajustar los permisos antes de guardar
        self.validate_access_fields()
        adjust_permissions()

        if self.content:
            self.excerpt = self.content[:200]

        super().save(*args, **kwargs)

