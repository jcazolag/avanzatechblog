from django.urls import path, include
from .views import get_csrf_token

app_name='api'

urlpatterns = [
    path('get_csfr/', get_csrf_token, name='csfr'),
    path('user/', include('user.urls')),
    path('blog/', include('blog.urls')),
    path('like/', include('like.urls')),
    path('comment/', include('comment.urls')),
]
