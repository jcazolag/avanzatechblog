from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Like
from blog.models import Blog
from .serializers import LikeSerializer
from blog.data.functions import can_view_blog, can_interact_blog

class LikePagination(PageNumberPagination):
    page_size = 15
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
        if not user.is_authenticated:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        blog_id = kwargs.get('blog_id')
        if not Blog.objects.filter(pk=blog_id).exists():
            return Response({"message": "No blog matches the query."}, status=status.HTTP_404_NOT_FOUND)
        blog = Blog.objects.get(pk=blog_id)

        if not can_interact_blog(user, blog):
            return Response({"message": "You do not have permission to like this blog."}, status=status.HTTP_403_FORBIDDEN)
        # Verificar si el usuario ya ha dado like
        if Like.objects.filter(user=user, blog=blog).exists():
            return Response({"message": "You have already liked this blog."}, status=status.HTTP_403_FORBIDDEN)


        # Crear like
        data = {'blog': blog.id}
        serializer = self.get_serializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
        if not Blog.objects.filter(pk=blog_id).exists():
            return Response({"message": "No blog matches the query."}, status=status.HTTP_404_NOT_FOUND)
        blog = Blog.objects.get(pk=blog_id)
        if not can_interact_blog(user, blog):  
            return Response({"message": "You do not have access this blog."}, status=status.HTTP_403_FORBIDDEN)
        # Buscar el like del usuario en ese blog
        if not Like.objects.filter(user=user.pk, blog=blog.pk).exists():
            return Response({"messasge": "No like matches the query."}, status=status.HTTP_404_NOT_FOUND)
        like = Like.objects.get(user=user, blog=blog)

        # Eliminar el like
        like.delete()
        return Response({"message": "Like removed successfully."}, status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        blog_id = kwargs.get('blog_id')
        if not Blog.objects.filter(pk=blog_id).exists():
            return Response({'message': 'No blog matches the query.'}, status=status.HTTP_404_NOT_FOUND)
        blog = Blog.objects.get(pk=blog_id)
        
        if not can_view_blog(user, blog):
            return Response({"message": "You do not have access this blog."}, status=status.HTTP_403_FORBIDDEN)
        
        if not Like.objects.filter(user=user.pk, blog=blog.pk).exists():
            return Response({'message': 'No like matches the query.'}, status=status.HTTP_404_NOT_FOUND)
        like = Like.objects.get(user=user.pk, blog=blog.pk)
        
        serializer = self.get_serializer(like)
        return Response(serializer.data, status=status.HTTP_200_OK)
