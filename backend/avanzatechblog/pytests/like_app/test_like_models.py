import pytest
from django.core.exceptions import ValidationError
from like.models import Like
from blog.models import Blog
from user.models import User

pytestmark = pytest.mark.django_db

def create_user(email="user@example.com", is_admin=False):
    user = User.objects.create_user(
        email=email,
        password="password123"
    )
    if is_admin:
        user.is_staff = True
        user.save()
    return user

def create_blog(author=None):
    if not author:
        author = create_user("author@example.com")
    return Blog.objects.create(
        author=author,
        title="Test Blog",
        content="Content",
        author_access="Read & Write",
        team_access="Read Only",
        authenticated_access="Read Only",
        public_access="Read Only"
    )

def test_user_can_like_accessible_blog():
    user = create_user()
    blog = create_blog()
    
    like = Like(user=user, blog=blog)
    like.save()
    
    assert Like.objects.filter(user=user, blog=blog).exists()

def test_user_cannot_like_same_blog_twice():
    user = create_user()
    blog = create_blog()

    Like.objects.create(user=user, blog=blog)
    like = Like(user=user, blog=blog)

    with pytest.raises(ValidationError, match="already liked"):
        like.full_clean()

def test_user_cannot_like_inaccessible_blog():
    user = create_user()
    author = create_user("author2@example.com")
    blog = Blog.objects.create(
        author=author,
        title="Private Blog",
        content="Secret",
        author_access="Read Only",
        team_access="None",
        authenticated_access="None",
        public_access="None"
    )

    like = Like(user=user, blog=blog)
    with pytest.raises(ValidationError, match="do not have permission"):
        like.full_clean()

def test_admin_cannot_like_blog():
    admin = create_user("admin@example.com", is_admin=True)
    blog = create_blog()

    like = Like(user=admin, blog=blog)
    with pytest.raises(ValidationError, match="Administrators cannot like"):
        like.full_clean()
