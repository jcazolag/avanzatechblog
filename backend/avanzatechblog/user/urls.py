from django.urls import path
from .viewsets import UserViewset
from .views import LoginAPIView, LogoutView


app_name='user'
urlpatterns = [
    path('register/', UserViewset.as_view({'post': 'create'}), name='register'),
    path('list/', UserViewset.as_view({'get': 'list'}), name="list"),
    path('retrieve/', UserViewset.as_view({'get': 'retrieve'}), name='retrieve'),
    path('login/', LoginAPIView.as_view(), name="api_login"),
    path('logout/', LogoutView.as_view(), name='logout'),
]
