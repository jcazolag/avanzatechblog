from django.urls import path
from .viewsets import LikeViewSet

app_name='like'
urlpatterns = [
    path('post/<int:blog_id>/like', LikeViewSet.as_view({'post': 'create'}), name='like'),
    path('list/', LikeViewSet.as_view({'get': 'list'}), name='list'),
    path('post/<int:blog_id>/unlike/', LikeViewSet.as_view({'delete': 'destroy'}), name='unlike')
]
