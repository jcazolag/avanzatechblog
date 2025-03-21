from django.urls import path
from .viewsets import CommentViewSet

app_name='comment'

urlpatterns = [
    path('post/<int:blog_id>/', CommentViewSet.as_view({'post': 'create'}), name="post"),
    path('list/', CommentViewSet.as_view({'get': 'list'}), name="list"),
    path('<int:pk>/', CommentViewSet.as_view({'put': 'update', 'get': 'retrieve', 'delete': 'destroy'}), name="detail")
]
