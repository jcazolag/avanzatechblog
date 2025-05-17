from django.urls import path
from .viewsets import LikeViewSet

app_name='like'
urlpatterns = [
    path('post/<int:blog_id>/', LikeViewSet.as_view({'post': 'create', 'delete': 'destroy', 'get': 'retrieve'}), name='detail'),
    path('list/', LikeViewSet.as_view({'get': 'list'}), name='list'),
]
