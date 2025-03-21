from rest_framework import serializers
from .models import Blog
from .data.choices import ACCESS_CHOICES

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = [
            'id',
            'author',
            'title',
            'content',
            'excerpt',
            'author_access',
            'team_access',
            'authenticated_access',
            'public_access'
        ]
        extra_kwargs = {
            'author': {'read_only': True},
            'excerpt': {'read_only': True},
            'id': {'read_only': True}
        }

    def validate(self, data):
        """Valida que los permisos de acceso sean correctos."""
        access_fields = ['public_access', 'authenticated_access', 'team_access', 'author_access']
        access_hierarchy = ['None', 'Read Only', 'Read & Write']

        # Validar que los valores sean válidos
        for field in access_fields:
            value = data.get(field)
            if not value:
                raise serializers.ValidationError(
                    {field: "Is empty."}
                )
            if not value or value and value not in dict(ACCESS_CHOICES).keys():
                raise serializers.ValidationError(
                    {field: f"'{value}' is not a valid value for {field}"}
                )

        # Obtener valores actuales del blog si es una actualización
        instance = getattr(self, 'instance', None)
        if instance:
            author_access = data.get('author_access', instance.author_access)
            team_access = data.get('team_access', instance.team_access)
            authenticated_access = data.get('authenticated_access', instance.authenticated_access)
            public_access = data.get('public_access', instance.public_access)
        else:
            author_access = data.get('author_access')
            team_access = data.get('team_access')
            authenticated_access = data.get('authenticated_access')
            public_access = data.get('public_access')

        # Validar jerarquía de accesos
        if (
            access_hierarchy.index(author_access) < access_hierarchy.index(team_access) or
            access_hierarchy.index(author_access) < access_hierarchy.index(authenticated_access) or
            access_hierarchy.index(author_access) < access_hierarchy.index(public_access)
        ):
            raise serializers.ValidationError(
                "Access permissions must follow the correct hierarchy."
            )

        return data

    def create(self, validated_data):
        """Crea un nuevo blog asegurando que el autor no sea un administrador."""
        user = self.context['request'].user
        if user.is_staff or user.team.title == 'admin' or user.role.title == 'admin':
            raise serializers.ValidationError({"author": "Administrators cannot be assigned as authors."})

        validated_data['author'] = user  # Asigna el usuario autenticado como autor
        return Blog.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Actualiza el blog asegurando que el autor no cambie."""
        if 'author' in validated_data:
            raise serializers.ValidationError({"author": "You cannot change the author of a blog."})

        return super().update(instance, validated_data)
