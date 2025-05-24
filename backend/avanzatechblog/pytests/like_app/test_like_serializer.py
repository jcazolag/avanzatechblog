import pytest
from django.contrib.auth.models import AnonymousUser
from like.models import Like
from like.serializers import LikeSerializer
from blog.models import Blog
from user.models import User, Team, Role

@pytest.fixture
def team():
    return Team.objects.create(title="team")

@pytest.fixture
def other_team():
    return Team.objects.create(title="other")

@pytest.fixture
def role():
    return Role.objects.create(title="user")

@pytest.fixture
def user(team, role):
    return User.objects.create_user(email="user1@example.com", password="pass", team=team, role=role)

@pytest.fixture
def other_user(other_team, role):
    return User.objects.create_user(email="user2@example.com", password="pass", team=other_team, role=role)

@pytest.fixture
def blog(user):
    return Blog.objects.create(
        author=user,
        title="Test Blog",
        content="Some content",
        author_access="Read & Write",
        team_access="Read Only",
        authenticated_access="None",
        public_access="None"
    )

@pytest.mark.django_db
def test_like_serializer_valid(user, blog):
    serializer = LikeSerializer(data={'blog': blog.id}, context={'request': type('Request', (), {'user': user})()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    assert instance.user == user
    assert instance.blog == blog

@pytest.mark.django_db
def test_like_serializer_duplicate(user, blog):
    Like.objects.create(user=user, blog=blog)
    serializer = LikeSerializer(data={'blog': blog.id}, context={'request': type('Request', (), {'user': user})()})
    assert not serializer.is_valid()
    assert 'detail' in serializer.errors
    assert serializer.errors['detail'][0] == "You have already liked this blog."

@pytest.mark.django_db
def test_like_serializer_invalid_blog(user):
    serializer = LikeSerializer(data={'blog': 999}, context={'request': type('Request', (), {'user': user})()})
    assert not serializer.is_valid()
    assert 'blog' in serializer.errors
    assert serializer.errors['blog'][0] == "Invalid blog ID."

@pytest.mark.django_db
def test_like_serializer_unauthenticated_user(blog):
    request = type('Request', (), {'user': AnonymousUser()})()
    serializer = LikeSerializer(data={'blog': blog.id}, context={'request': request})
    assert not serializer.is_valid()
    assert 'detail' in serializer.errors
    assert serializer.errors['detail'][0] == "You do not have permission to like this blog."

@pytest.mark.django_db
def test_like_serializer_user_without_permission(other_user, blog):
    blog.team_access = "None"
    blog.authenticated_access = "None"
    blog.public_access = "None"
    blog.save()

    serializer = LikeSerializer(data={'blog': blog.id}, context={'request': type('Request', (), {'user': other_user})()})
    assert not serializer.is_valid()
    assert 'detail' in serializer.errors
    assert serializer.errors['detail'][0] == "You do not have permission to like this blog."

@pytest.mark.django_db
def test_like_serializer_missing_blog(user):
    serializer = LikeSerializer(data={}, context={'request': type('Request', (), {'user': user})()})
    assert not serializer.is_valid()
    assert 'blog' in serializer.errors
    assert serializer.errors['blog'][0] == "This field is required."
