from django.db import models
from blog.models import Blog
from user.models import User
from django.core.exceptions import ValidationError
from blog.data.functions import can_interact_blog

# Create your models here.


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(null=False, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"Comment by {self.user.email} on {self.blog.title}"

    def clean(self):
        """Valida si el usuario tiene permisos para dar like."""
        if not self.content:
            raise ValidationError("Content must be set.")
        
        if not Blog.objects.filter(pk=self.blog.pk).exists():
            raise ValidationError("The blog does not exists.")

        if self.user.is_staff or self.user.team.title == 'admin' or self.user.role.title == 'admin':
            raise ValidationError("Administrators cannot comment blogs.")

        if not can_interact_blog(self.user, self.blog):
            raise ValidationError("You do not have permission to comment this blog.")

    def save(self, *args, **kwargs):
        self.clean()  # Validar antes de guardar
        super().save(*args, **kwargs)