import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from user.models import User
from blog.models import Blog
from comment.models import Comment

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_users():
    user = User.objects.create_user(username="user", email="user@test.com", password="testpass")
    admin = User.objects.create_superuser(username="admin", email="admin@test.com", password="adminpass")
    return user, admin

@pytest.fixture
def create_blog(create_users):
    user, _ = create_users
    return Blog.objects.create(author=user, title="Test Blog", content="Sample Content", author_access="Read & Write")

@pytest.fixture
def create_comment(create_users, create_blog):
    user, _ = create_users
    return Comment.objects.create(user=user, blog=create_blog, content="Test Comment")

@pytest.mark.django_db
def test_create_comment(api_client, create_users, create_blog):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:comment:post', kwargs={'blog_id': create_blog.id})
    response = api_client.post(url, {"content": "New Comment"}, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["content"] == "New Comment"
    assert response.data["user"] == user.id
    assert response.data["blog"] == create_blog.id

@pytest.mark.django_db
def test_list_comments(api_client, create_users, create_blog, create_comment):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:comment:list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0

@pytest.mark.django_db
def test_retrieve_comment(api_client, create_users, create_comment):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:comment:detail', kwargs={'pk': create_comment.id})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["content"] == create_comment.content

@pytest.mark.django_db
def test_update_comment(api_client, create_users, create_comment):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:comment:detail', kwargs={'pk': create_comment.id})
    response = api_client.put(url, {"content": "Updated Comment", "blog": create_comment.blog.pk}, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["content"] == "Updated Comment"

@pytest.mark.django_db
def test_delete_comment(api_client, create_users, create_comment):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:comment:detail', kwargs={'pk': create_comment.id})
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Comment.objects.filter(id=create_comment.id).exists()