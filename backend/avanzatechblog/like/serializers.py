from rest_framework import serializers
from .models import Like
from blog.models import Blog

def can_view_blog(user, blog):
    """Determina si el usuario puede ver el blog y, por lo tanto, darle like."""
    if not user.is_authenticated:
        return False

    return (
        blog.authenticated_access in ['Read Only', 'Read & Write'] or
        (blog.author == user and blog.author_access in ['Read Only', 'Read & Write']) or
        (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
    )

class LikeSerializer(serializers.ModelSerializer):
    #blog_title = serializers.CharField(source='blog.title', read_only=True)
    user_name = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'blog', 'user_name', 'created_at']
        read_only_fields = ['user', 'created_at', 'blog']

    def validate(self, data):
        """Valida si el usuario puede dar like a este blog."""
        request = self.context.get('request')
        user = request.user if request else None
        blog_id = self.initial_data.get('blog')  # Evita errores si 'blog' no está en el request

        if not blog_id:
            raise serializers.ValidationError({"blog": "This field is required."})

        blog = Blog.objects.filter(id=blog_id).first()
        if not blog:
            raise serializers.ValidationError({"blog": "Invalid blog ID."})

        if Like.objects.filter(user=user, blog=blog).exists():
            raise serializers.ValidationError({"detail": "You have already liked this blog."})

        if not can_view_blog(user, blog):
            raise serializers.ValidationError({"detail": "You do not have permission to like this blog."})

        data['blog'] = blog  # Asigna la instancia del blog validado
        return data

    def create(self, validated_data):
        """Asigna automáticamente el usuario autenticado al like."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)