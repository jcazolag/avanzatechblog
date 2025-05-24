from django.urls import path
from .viewsets import UserViewset

app_name='user'
urlpatterns = [
    path('register/', UserViewset.as_view({'post': 'create'}), name='register'),
    path('list/', UserViewset.as_view({'get': 'list'}), name="list"),
    path('me/', UserViewset.as_view({'get': 'me'}), name='me'),
    path('<int:pk>/', UserViewset.as_view({'get': 'retrieve'}), name='retrieve'),
    path('login/', UserViewset.as_view({'post': 'login'}), name='login'),
    path('logout/', UserViewset.as_view({'post': 'logout'}), name='logout')
]
