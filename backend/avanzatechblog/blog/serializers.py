from rest_framework import serializers
from .models import Blog
from .data.choices import ACCESS_CHOICES

class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.email', read_only=True)
    author_team = serializers.IntegerField(source='author.team.id', read_only=True)
    author_team_title = serializers.CharField(source='author.team.title', read_only=True)

    class Meta:
        model = Blog
        fields = [
            'id',
            'author',
            'author_name',
            'author_team',
            'author_team_title',
            'title',
            'content',
            'excerpt',
            'timestamp',
            'author_access',
            'team_access',
            'authenticated_access',
            'public_access',
        ]
        read_only_fields = ['author', 'excerpt', 'id', 'timestamp']
    
    def validate(self, data):
        """Valida los permisos de acceso según la jerarquía definida."""
        access_fields = ['public_access', 'authenticated_access', 'team_access', 'author_access']
        choices_map = dict(ACCESS_CHOICES)

        # Validar valores válidos
        for field in access_fields:
            value = data.get(field)
            if value is None:
                raise serializers.ValidationError({field: "Is empty."})
            if value not in choices_map:
                raise serializers.ValidationError({field: f"'{value}' is not a valid value."})

        # Obtener valores actuales en caso de update
        instance = getattr(self, 'instance', None)
        author_access = data.get('author_access', instance.author_access if instance else None)
        team_access = data.get('team_access', instance.team_access if instance else None)
        authenticated_access = data.get('authenticated_access', instance.authenticated_access if instance else None)
        public_access = data.get('public_access', instance.public_access if instance else None)

        # --- Jerarquía personalizada ---
        if author_access == 'Read Only':
            if team_access == 'Read & Write' or authenticated_access == 'Read & Write' or public_access == 'Read & Write':
                raise serializers.ValidationError("If author_access is 'Read Only', no one else can have 'Read & Write'.")

        if team_access == 'Read Only':
            if authenticated_access == 'Read & Write' or public_access == 'Read & Write':
                raise serializers.ValidationError("If team_access is 'Read Only', only the author can have 'Read & Write'.")

        if team_access == 'None':
            if authenticated_access != 'None' or public_access != 'None':
                raise serializers.ValidationError("If team_access is 'None', only the author can have access.")

        if authenticated_access == 'None' and public_access != 'None':
            raise serializers.ValidationError("If authenticated_access is 'None', public_access must also be 'None'.")

        if public_access not in ['Read Only', 'None']:
            raise serializers.ValidationError("public_access must be either 'Read Only' or 'None'.")

        return data


    def create(self, validated_data):
        user = self.context['request'].user
        if user.is_staff or user.team.title == 'admin' or user.role.title == 'admin':
            raise serializers.ValidationError("Administrators cannot be assigned as authors.")

        validated_data['author'] = user  # Asigna el usuario autenticado como autor
        return Blog.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'author' in validated_data:
            raise serializers.ValidationError("You cannot change the author of a blog.")

        return super().update(instance, validated_data)
