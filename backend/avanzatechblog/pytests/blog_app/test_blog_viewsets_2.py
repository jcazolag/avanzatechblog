import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from blog.models import Blog
from user.models import User, Team, Role

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def team():
    return Team.objects.create(title='dev')

@pytest.fixture
def role():
    return Role.objects.create(title='writer')

@pytest.fixture
def user(team, role):
    return User.objects.create_user(email='user1@test.com', password='123456', team=team, role=role)

@pytest.fixture
def admin_user(team, role):
    return User.objects.create_user(email='admin@test.com', password='123456', is_staff=True, team=team, role=role)

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

def test_create_blog(auth_client):
    url = reverse('api:blog:post')
    data = {
        "title": "Test Blog",
        "content": "Lorem ipsum",
        "author_access": "Read & Write",
        "team_access": "Read Only",
        "authenticated_access": "None",
        "public_access": "None"
    }
    response = auth_client.post(url, data)
    assert response.status_code == 201
    assert response.data['title'] == "Test Blog"


def test_create_blog_admin_forbidden(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('api:blog:post')
    data = {
        "title": "Admin Blog",
        "content": "Admin attempt",
        "author_access": "Read & Write",
        "team_access": "Read Only",
        "authenticated_access": "None",
        "public_access": "None"
    }
    response = api_client.post(url, data)
    assert response.status_code == 400
    assert "Administrators cannot be assigned" in str(response.data)


@pytest.mark.django_db
def test_list_public_blogs(api_client, user):
    Blog.objects.create(
        author=user,
        title='Public Blog',
        content='Hello World',
        author_access='Read & Write',
        team_access='Read Only',
        authenticated_access='Read Only',
        public_access='Read Only'
    )
    url = reverse('api:blog:list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['results'][0]['title'] == 'Public Blog'


def test_retrieve_blog_no_access(api_client, user):
    blog = Blog.objects.create(
        author=user,
        title='Private Blog',
        content='Hidden',
        author_access='Read & Write',
        team_access='None',
        authenticated_access='None',
        public_access='None'
    )
    url = reverse('api:blog:detail', args=[blog.id])
    response = api_client.get(url)
    assert response.status_code == 404


def test_update_blog_no_permission(api_client, user, team, role):
    blog = Blog.objects.create(
        author=user,
        title='Immutable',
        content='Old content',
        author_access='Read Only',
        team_access='None',
        authenticated_access='None',
        public_access='None'
    )
    another_user = User.objects.create_user(email='other@test.com', password='123456', team=team, role=role)
    api_client.force_authenticate(user=another_user)
    url = reverse('api:blog:detail', args=[blog.id])
    data = {
        "title": "Updated",
        "content": "New",
        "author_access": "Read & Write",
        "team_access": "None",
        "authenticated_access": "None",
        "public_access": "None"
    }
    response = api_client.put(url, data)
    assert response.status_code == 403

