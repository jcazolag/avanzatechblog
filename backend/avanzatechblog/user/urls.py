from django.urls import path, include
from .viewsets import UserViewset

app_name='user'

urlpatterns = [
    path('register/', UserViewset.as_view({'post': 'create'}), name='register'),
    path('list/', UserViewset.as_view({'get': 'list'}), name="list"),
]
