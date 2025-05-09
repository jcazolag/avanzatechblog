from django.db import models
from user.models import User
from blog.models import Blog
from django.core.exceptions import ValidationError

# Create your models here.

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'blog')
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} liked {self.blog.title}"

    def clean(self):
        """Valida si el usuario tiene permisos para dar like."""
        if self.user.is_staff or self.user.team.title == 'admin' or self.user.role.title == 'admin':
            raise ValidationError("Administrators cannot like blogs.")

        if Like.objects.filter(user=self.user, blog=self.blog).exists():
            raise ValidationError("You have already liked this blog.")

        if not self.can_like_blog():
            raise ValidationError("You do not have permission to like this blog.")

    def save(self, *args, **kwargs):
        self.clean()  # Validar antes de guardar
        super().save(*args, **kwargs)

    def can_like_blog(self):
        """Verifica si el usuario tiene acceso para dar like a un blog."""
        if self.blog.author == self.user and self.blog.author_access in ['Read & Write', 'Read Only']:
            return True
        if self.blog.team_access in ['Read & Write', 'Read Only'] and self.user.team == self.blog.author.team:
            return True
        if self.user.is_authenticated and self.blog.authenticated_access in ['Read & Write', 'Read Only']:
            return True
        return False