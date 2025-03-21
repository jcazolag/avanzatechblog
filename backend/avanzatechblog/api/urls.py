from django.urls import path, include

app_name='api'

urlpatterns = [
    path('user/', include('user.urls')),
    path('blog/', include('blog.urls')),
    path('like/', include('like.urls')),
    path('comment/', include('comment.urls')),
]
