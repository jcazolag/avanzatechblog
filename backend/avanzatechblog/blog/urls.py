from django.urls import path
from .viewsets import BlogViewSet

app_name="blog"

urlpatterns = [
    path('post/', BlogViewSet.as_view({'post': 'create'}), name='post'),
    path('list/', BlogViewSet.as_view({'get': 'list'}), name='list'),
    path('post/<int:pk>/', BlogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detail'),
]
