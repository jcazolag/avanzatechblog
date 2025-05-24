from rest_framework import serializers
from .models import Comment
from blog.models import Blog
from blog.data.functions import can_interact_blog

class CommentSerializer(serializers.ModelSerializer):
    blog_title = serializers.CharField(source='blog.title', read_only=True)
    user_name = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name','blog', 'content', 'blog_title', 'timestamp']
        read_only_fields = ['user', 'timestamp', 'blog']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        try:
            blog_id = int(self.initial_data.get('blog'))
        except (TypeError, ValueError):
            raise serializers.ValidationError({"blog": "This field is required."})

        blog = Blog.objects.filter(id=blog_id).first()
        if not blog:
            raise serializers.ValidationError({"blog": "Invalid blog ID."})


        if not can_interact_blog(user, blog) or user.is_staff or getattr(user.team, 'title', '') == 'admin' or getattr(user.role, 'title', '') == 'admin':
            raise serializers.ValidationError("You do not have permission to comment on this blog.")

        data['blog'] = blog
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)