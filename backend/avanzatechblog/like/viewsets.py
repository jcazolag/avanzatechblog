from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Like
from blog.models import Blog
from .serializers import LikeSerializer
from django.shortcuts import get_object_or_404

class LikePagination(PageNumberPagination):
    page_size = 1
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'current_page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'total_count': self.page.paginator.count,
            'next_page': self.get_next_link(),
            'previous_page': self.get_previous_link(),
            'results': data
        })
    


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    pagination_class = LikePagination

    def create(self, request, *args, **kwargs):
        user = request.user
        blog_id = kwargs.get('blog_id')  # Tomamos el blog_id desde la URL
        blog = get_object_or_404(Blog, id=blog_id)

        # Validar que el usuario tenga acceso al blog
        if not self._can_like_blog(user, blog):
            return Response({"message": "You do not have permission to like this blog."}, status=status.HTTP_403_FORBIDDEN)
        # Verificar si el usuario ya ha dado like
        if Like.objects.filter(user=user, blog=blog).exists():
            return Response({"message": "You have already liked this blog."}, status=status.HTTP_400_BAD_REQUEST)


        # Crear like
        data = {'blog': blog.id}
        serializer = self.get_serializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)  # Asignar usuario al guardar

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        user = request.user

        # Filtrar blogs a los que el usuario tiene acceso de lectura
        accessible_blogs = Blog.objects.filter(public_access__in=['Read Only'])

        if user.is_authenticated:
            accessible_blogs = accessible_blogs | Blog.objects.filter(authenticated_access__in=['Read Only', 'Read & Write'])
            accessible_blogs = accessible_blogs | Blog.objects.filter(author=user, author_access__in=['Read Only', 'Read & Write'])

            if hasattr(user, 'team') and user.team:
                accessible_blogs = accessible_blogs | Blog.objects.filter(team_access__in=['Read Only', 'Read & Write'], author__team=user.team)

        # Asegurar que los blogs sean únicos
        accessible_blogs = accessible_blogs.distinct()

        # Filtrar likes solo a blogs accesibles
        likes_queryset = Like.objects.filter(blog__in=accessible_blogs)

        # Aplicar filtros opcionales por parámetros de URL
        blog_id = request.query_params.get('blog_id')
        user_id = request.query_params.get('user_id')

        if blog_id:
            likes_queryset = likes_queryset.filter(blog_id=blog_id)
        if user_id:
            likes_queryset = likes_queryset.filter(user_id=user_id)

        # Aplicar paginación
        paginator = self.pagination_class()
        paginated_likes = paginator.paginate_queryset(likes_queryset, request)
        serializer = self.get_serializer(paginated_likes, many=True)

        return paginator.get_paginated_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        blog_id = kwargs.get('blog_id')  # Obtener el ID del blog desde la URL

        # Buscar el blog y verificar acceso
        blog = get_object_or_404(Blog, id=blog_id)
        if not self._can_like_blog(user, blog):  
            return Response({"detail": "You do not have access this blog."}, status=status.HTTP_403_FORBIDDEN)
        # Buscar el like del usuario en ese blog
        like = get_object_or_404(Like, user=user, blog=blog)

        # Eliminar el like
        like.delete()
        return Response({"message": "Like removed successfully."}, status=status.HTTP_204_NO_CONTENT)

    def _can_like_blog(self, user, blog):
        """Verifica si el usuario tiene permisos para dar like al blog."""
        return (
            user.is_authenticated and (
                (blog.authenticated_access in ['Read Only', 'Read & Write']) or
                (user == blog.author and blog.author_access in ['Read Only', 'Read & Write']) or
                (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
            )
        )