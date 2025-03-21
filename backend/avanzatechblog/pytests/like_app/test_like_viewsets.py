import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from blog.models import Blog
from like.models import Like

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", email="test@example.com", password="password123")

@pytest.fixture
def another_user(db):
    return User.objects.create_user(username="anotheruser", email="another@example.com", password="password123")

@pytest.fixture
def blog(db, user):
    return Blog.objects.create(
        author=user,
        title="Test Blog",
        content="This is a test blog.",
        public_access="Read Only"
    )

@pytest.fixture
def like(db, user, blog):
    return Like.objects.create(user=user, blog=blog)

@pytest.mark.django_db
def test_create_like(api_client, user, blog):
    api_client.force_authenticate(user=user)
    response = api_client.post(f"/api/like/post/{blog.id}/like")
    assert response.status_code == 201
    assert Like.objects.filter(user=user, blog=blog).exists()

@pytest.mark.django_db
def test_create_like_twice(api_client, user, blog, like):
    api_client.force_authenticate(user=user)
    response = api_client.post(f"/api/like/post/{blog.id}/like")
    assert response.status_code == 400  # No puede dar like dos veces

@pytest.mark.django_db
def test_create_like_unauthenticated(api_client, blog):
    response = api_client.post(f"/api/like/post/{blog.id}/like")
    assert response.status_code == 403  # Usuario no autenticado

@pytest.mark.django_db
def test_list_likes(api_client, user, blog, like):
    api_client.force_authenticate(user=user)
    response = api_client.get("/api/like/list/")
    assert response.status_code == 200
    assert response.data["total_count"] == 1

@pytest.mark.django_db
def test_delete_like(api_client, user, blog, like):
    api_client.force_authenticate(user=user)
    response = api_client.delete(f"/api/like/post/{blog.id}/unlike/")
    assert response.status_code == 204
    assert not Like.objects.filter(user=user, blog=blog).exists()

@pytest.mark.django_db
def test_delete_like_unauthorized(api_client, another_user, blog, like):
    api_client.force_authenticate(user=another_user)
    response = api_client.delete(f"/api/like/post/{blog.id}/unlike/")
    assert response.status_code == 404