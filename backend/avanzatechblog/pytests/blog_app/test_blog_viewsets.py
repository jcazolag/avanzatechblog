import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from user.models import User
from blog.models import Blog

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_users():
    user = User.objects.create_user(email="user@test.com", password="testpass")
    admin = User.objects.create_superuser(email="admin@test.com", password="adminpass")
    return user, admin

@pytest.fixture
def create_blog(create_users):
    user, _ = create_users
    return Blog.objects.create(author=user, title="Test Blog", content="Sample Content", author_access="Read & Write")

@pytest.mark.django_db
def test_create_blog(api_client, create_users):
    user, admin = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:blog:post')
    response = api_client.post(
        url,
        {
            "title": "New Blog", 
            "content": "Blog Content", 
            "author_access": "Read & Write", 
            "team_access": "Read Only", 
            "authenticated_access": "Read Only",
            "public_access": "Read Only"
        }, 
        format="json"
        )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["title"] == "New Blog"
    assert response.data["content"] == "Blog Content"
    assert response.data["excerpt"] == response.data["content"][:200]
    assert response.data["author_access"] == "Read & Write"
    assert response.data["team_access"] == "Read Only"
    assert response.data["authenticated_access"] == "Read Only"
    assert response.data["public_access"] == "Read Only"

@pytest.mark.django_db
def test_create_blog_admin_forbidden(api_client, create_users):
    _, admin = create_users
    api_client.force_authenticate(user=admin)
    url = reverse('api:blog:post')
    response = api_client.post(url, {"title": "Admin Blog", "content": "Admin Content"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_list_blogs(api_client, create_users, create_blog):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:blog:list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0

@pytest.mark.django_db
def test_retrieve_blog(api_client, create_users, create_blog):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:blog:detail', kwargs={'pk': create_blog.id})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["title"] == create_blog.title

@pytest.mark.django_db
def test_update_blog(api_client, create_users, create_blog):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:blog:detail', kwargs={'pk': create_blog.id})
    response = api_client.put(
            url, 
            {
                "title": "Updated Blog",
                "content": "Updated Content",
                "author_access": "Read & Write", 
                "team_access": "Read Only", 
                "authenticated_access": "Read Only",
                "public_access": "Read Only"
            }, 
            format="json"
        )
    assert response.status_code == status.HTTP_200_OK
    assert response.data["title"] == "Updated Blog"

@pytest.mark.django_db
def test_delete_blog(api_client, create_users, create_blog):
    user, _ = create_users
    api_client.force_authenticate(user=user)
    url = reverse('api:blog:detail', kwargs={'pk': create_blog.id})
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Blog.objects.filter(id=create_blog.id).exists()