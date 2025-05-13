from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Comment
from blog.models import Blog
from .serializers import CommentSerializer
from django.db.models import Q
from django.shortcuts import get_object_or_404

class CommentPagination(PageNumberPagination):
    page_size = 5
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
    


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def create(self, request, *args, **kwargs):
        user = request.user
        blog_id = kwargs.get('blog_id')  # Tomamos el blog_id desde la URL
        
        if not Blog.objects.filter(pk=blog_id).exists():
            return Response({"message": "No Blog matches the given query."}, status=status.HTTP_404_NOT_FOUND)

        blog = Blog.objects.get(pk=blog_id)
        # Validar que el usuario tenga acceso al blog
        if not self._can_comment_blog(user, blog):
            return Response({"message": "You do not have permission to comment this blog."}, status=status.HTTP_403_FORBIDDEN)

        data = {'blog': blog.id, 'content': request.data.get('content')}

        serializer = self.get_serializer(data=data, context={'request': request})
        if serializer.is_valid(raise_exception=False):
            serializer.save(user=user)  # Asignar usuario al guardar
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"message": 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    
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
        comments_queryset = Comment.objects.filter(blog__in=accessible_blogs)

        # Aplicar filtros opcionales por parámetros de URL
        blog_id = request.query_params.get('blog_id')
        user_id = request.query_params.get('user_id')

        if blog_id:
            comments_queryset = comments_queryset.filter(blog_id=blog_id)
        if user_id:
            comments_queryset = comments_queryset.filter(user_id=user_id)

        # Aplicar paginación
        paginator = self.pagination_class()
        paginated_comments = paginator.paginate_queryset(comments_queryset, request)
        serializer = self.get_serializer(paginated_comments, many=True)

        return paginator.get_paginated_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        comment = self.get_object()
        blog = comment.blog
        if self._can_comment_blog(user, blog) and comment.user == user:
            self.perform_destroy(comment)
            return Response({"message": "Blog removed successfully."},status=status.HTTP_204_NO_CONTENT)
        return Response({'message': 'You do not have permission to delete this comment.'}, status=status.HTTP_403_FORBIDDEN)
    
    def retrieve(self, request, *args, **kwargs):
        comment = self.get_object()
        if not self._can_comment_blog(request.user, comment.blog) or comment.user != request.user:
            return Response({'message': 'You do not have access to this comment.'}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if not self._can_comment_blog(request.user, comment.blog) or comment.user != request.user:
            return Response({'message': 'You do not have permission to modify this comment.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(comment, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def _can_comment_blog(self, user, blog):
        """Verifica si el usuario tiene permisos para comentar al blog."""
        return (
            user.is_authenticated and (
                (blog.authenticated_access in ['Read Only', 'Read & Write']) or
                (user == blog.author and blog.author_access in ['Read Only', 'Read & Write']) or
                (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
            )
        )