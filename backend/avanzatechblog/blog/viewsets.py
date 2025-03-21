from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Blog
from .serializers import BlogSerializer
from django.db.models import Q

def can_edit_blog(user, blog):
    return (
        user.is_authenticated and (
            (blog.author == user and blog.author_access == 'Read & Write') or
            (blog.team_access == 'Read & Write' and user.team == blog.author.team) or
            (blog.authenticated_access == 'Read & Write')
        )
    )

def can_view_blog(user, blog):
    return (
        blog.public_access in ['Read Only'] or (
            user.is_authenticated and (
                (blog.authenticated_access in ['Read Only', 'Read & Write']) or
                (blog.author == user and blog.author_access in ['Read Only', 'Read & Write']) or
                (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
            )
        )
    )

class BlogPagination(PageNumberPagination):
    page_size = 10
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

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    pagination_class = BlogPagination

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'detail': 'You have to be loged to post a blog.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.is_staff:
            return Response({'detail': 'Admins can not create blogs'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        blog = self.get_object()  # Maneja automáticamente el 404
        if not can_edit_blog(user, blog):
            return Response({"detail": "You don't have permission to edit this blog."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(blog, data=request.data, partial=False)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        user = request.user

        filters = Q(public_access__in=['Read Only'])
        if user.is_authenticated:
            filters |= Q(authenticated_access__in=['Read Only', 'Read & Write'])
            filters |= Q(author_access__in=['Read Only', 'Read & Write'], author=user)

            # Si el usuario tiene un equipo, aplicamos el filtro de equipo
            if hasattr(user, 'team'):
                filters |= Q(team_access__in=['Read Only', 'Read & Write'], author__team=user.team)

        # Aplicamos el filtro a la consulta
        posts = Blog.objects.filter(filters).distinct()
        
        # Aplicar paginación
        paginator = self.pagination_class()
        paginated_likes = paginator.paginate_queryset(posts, request)
        serializer = self.get_serializer(paginated_likes, many=True)

        return paginator.get_paginated_response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        user = request.user
        blog = self.get_object()

        if can_view_blog(user, blog):
            serializer = self.get_serializer(blog)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({'detail': 'You do not have access to this blog.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def destroy(self, request, *args, **kwargs):
        user = request.user
        blog = self.get_object()

        if can_edit_blog(user, blog):
            self.perform_destroy(blog)
            return Response({"detail": "Blog removed successfully."},status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'You do not have permission to delete this blog.'}, status=status.HTTP_401_UNAUTHORIZED)
