import pytest
from django.core.exceptions import ValidationError
from blog.models import Blog
from user.models import User, Team, Role
from like.models import Like

def create_user(username, email, password, team_title):
    team=None
    if team_title:
        team = Team.objects.create(title=team_title)
    return User.objects.create_user(username=username, email=email, password=password, team=team)

def create_admin(username, email, password):
    return User.objects.create_admin(username=username, email=email, password=password)

def create_blog(author, title="Test Blog", author_access="Read & Write", team_access="Read Only", authenticated_access="Read Only"):
    return Blog.objects.create(
        author=author,
        title=title,
        content="Sample content",
        author_access=author_access,
        team_access=team_access,
        authenticated_access=authenticated_access
    )

def test_create_like_valid(db):
    user = create_user("testuser", "test@example.com", "test", "Test Team")
    blog = create_blog(user)
    like = Like(user=user, blog=blog)
    like.save()
    assert Like.objects.filter(user=user, blog=blog).exists()

def test_like_duplicate_fails(db):
    user = create_user("testuser", "test@example.com", "test", "Test Team")
    blog = create_blog(user)
    Like.objects.create(user=user, blog=blog)
    with pytest.raises(ValidationError, match="You have already liked this blog."):
        like = Like(user=user, blog=blog)
        like.full_clean()

def test_admin_cannot_like(db):
    admin = create_admin("adminuser", "admin@example.com", "admin")
    author = create_user("normaluser", "user@example.com", "user", None)  # Crear un usuario normal
    blog = create_blog(author)  # Crear el blog con un usuario normal

    with pytest.raises(ValidationError, match="Administrators cannot like blogs."):
        Like.objects.create(user=admin, blog=blog)

def test_cannot_like_blog_without_permission(db):
    author = create_user("author", "author@example.com", "test", "Team A")
    other_user = create_user("otheruser", "other@example.com", "other", "Team B")
    blog = create_blog(author, author_access="Read Only", team_access="None", authenticated_access="None")
    with pytest.raises(ValidationError, match="You do not have permission to like this blog."):
        like = Like(user=other_user, blog=blog)
        like.full_clean()
