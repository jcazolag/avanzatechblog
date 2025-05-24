from rest_framework import serializers
from .models import Like
from blog.models import Blog
from blog.data.functions import can_interact_blog

class LikeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'blog', 'user_name', 'created_at']
        read_only_fields = ['user', 'created_at', 'blog']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        
        if not user or not user.is_authenticated:
            raise serializers.ValidationError({"detail": "You do not have permission to like this blog."})

        blog_id = self.initial_data.get('blog')

        if not blog_id:
            raise serializers.ValidationError({"blog": "This field is required."})

        blog = Blog.objects.filter(id=blog_id).first()
        if not blog:
            raise serializers.ValidationError({"blog": "Invalid blog ID."})

        if Like.objects.filter(user=user.id, blog=blog).exists():
            raise serializers.ValidationError({"detail": "You have already liked this blog."})

        if not can_interact_blog(user, blog) or user.is_staff or getattr(user.team, 'title', '') == 'admin' or getattr(user.role, 'title', '') == 'admin':
            raise serializers.ValidationError({"detail": "You do not have permission to like this blog."})

        data['blog'] = blog
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)