import pytest
from rest_framework import status
from rest_framework.test import APIClient
from blog.models import Blog
from like.models import Like
from user.models import User, Team, Role

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def team():
    return Team.objects.create(title="Team A")

@pytest.fixture
def role():
    return Role.objects.create(title="Member")

@pytest.fixture
def user(team, role):
    return User.objects.create_user(email="user@example.com", password="pass1234", team=team, role=role)

@pytest.fixture
def blog(user):
    return Blog.objects.create(
        author=user,
        title="Test Blog",
        content="Sample content",
        author_access="Read & Write",
        team_access="Read & Write",
        authenticated_access="Read Only",
        public_access="None",
    )

@pytest.fixture
def like(user, blog):
    return Like.objects.create(user=user, blog=blog)

@pytest.mark.django_db
def test_like_create_success(client, user, blog):
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.post(url)
    assert response.status_code == status.HTTP_201_CREATED
    assert Like.objects.filter(user=user, blog=blog).exists()

@pytest.mark.django_db
def test_like_create_unauthenticated(client, blog):
    url = f"/api/like/post/{blog.id}/"
    response = client.post(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_like_create_duplicate(client, user, blog):
    Like.objects.create(user=user, blog=blog)
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.post(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['message'] == "You have already liked this blog."

@pytest.mark.django_db
def test_like_retrieve_success(client, user, blog):
    like = Like.objects.create(user=user, blog=blog)
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['blog'] == blog.id
    assert response.data['user'] == user.id

@pytest.mark.django_db
def test_like_retrieve_not_found(client, user, blog):
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_like_delete_success(client, user, blog):
    Like.objects.create(user=user, blog=blog)
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Like.objects.filter(user=user, blog=blog).exists()

@pytest.mark.django_db
def test_like_delete_not_found(client, user, blog):
    client.force_authenticate(user)
    url = f"/api/like/post/{blog.id}/"
    response = client.delete(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_like_list(client, user, blog):
    Like.objects.create(user=user, blog=blog)
    client.force_authenticate(user)
    url = "/api/like/list/"
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_count'] == 1
    assert len(response.data['results']) == 1
