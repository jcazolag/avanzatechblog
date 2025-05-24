from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Blog
from .serializers import BlogSerializer
from .data.functions import can_edit_blog, can_view_blog


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
    pagination_class = BlogPagination
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Lectura para todos, escritura autenticado


    def list(self, request, *args, **kwargs):
        user = request.user
        filters = Q(public_access='Read Only')

        if user.is_authenticated:
            filters |= Q(authenticated_access__in=['Read Only', 'Read & Write'])
            filters |= Q(author=user, author_access__in=['Read Only', 'Read & Write'])

            if hasattr(user, 'team') and user.team:
                filters |= Q(author__team=user.team, team_access__in=['Read Only', 'Read & Write'])

        blogs = Blog.objects.filter(filters).distinct()

        page = self.paginate_queryset(blogs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(blogs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        blog = self.get_object()
        if not can_view_blog(request.user, blog):
            return Response({'message': 'You do not have access to this blog.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(blog)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        blog = self.get_object()
        if not can_edit_blog(request.user, blog):
            return Response({'message': 'You do not have permission to edit this blog.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(blog, data=request.data, partial=False, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        blog = self.get_object()
        if not can_edit_blog(request.user, blog):
            return Response({'message': 'You do not have permission to delete this blog.'}, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(blog)
        return Response({'message': 'Blog removed successfully.'}, status=status.HTTP_204_NO_CONTENT)

