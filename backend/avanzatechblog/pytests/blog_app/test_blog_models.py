import pytest
from blog.models import Blog
from user.models import User, Team, Role
from django.core.exceptions import ValidationError

pytestmark = pytest.mark.django_db


def create_user(email="user@example.com", is_staff=False, role_title="editor", team_title="marketing"):
    role = Role.objects.create(title=role_title)
    team = Team.objects.create(title=team_title)
    return User.objects.create_user(email=email, password="password123", role=role, team=team, is_staff=is_staff)


def test_create_blog_valid():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="My First Blog",
        content="This is the content of the blog.",
        author_access="Read & Write",
        team_access="Read Only",
        authenticated_access="Read Only",
        public_access="None"
    )
    assert blog.pk is not None
    assert blog.excerpt == blog.content[:200]


def test_admin_cannot_be_author():
    user = create_user(is_staff=True)
    blog = Blog(
        author=user,
        title="Admin Blog",
        content="Admins shouldn't post."
    )
    with pytest.raises(ValidationError, match="Administrators cannot be assigned as authors."):
        blog.full_clean()


def test_access_fields_invalid_value_are_corrected():
    user = create_user()
    blog = Blog(
        author=user,
        title="Access Test",
        content="content",
        author_access="Invalid",  # deliberately invalid
        team_access="Invalid",
        authenticated_access="Invalid",
        public_access="Invalid"
    )
    blog.save()
    assert blog.author_access == "Read Only"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "Read Only"
    assert blog.public_access == "Read Only"


def test_permissions_respected():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="Hierarchy Test",
        content="content",
        author_access="Read & Write",
        team_access="Read & Write",
        authenticated_access="Read & Write",
        public_access="Read Only"
    )

    assert blog.author_access == "Read & Write"
    assert blog.team_access == "Read & Write"
    assert blog.authenticated_access == "Read & Write"
    assert blog.public_access == "Read Only"

def test_permission_author():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="Hierarchy Test",
        content="content",
        author_access="Read Only",
        team_access="Read & Write",
        authenticated_access="Read & Write",
        public_access="Read Only"
    )

    assert blog.author_access == "Read Only"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "Read Only"
    assert blog.public_access == "Read Only"

def test_permission_team_read_only():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="Hierarchy Test",
        content="content",
        author_access="Read & Write",
        team_access="Read Only",
        authenticated_access="Read & Write",
        public_access="Read Only"
    )

    assert blog.author_access == "Read & Write"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "Read Only"
    assert blog.public_access == "Read Only"

def test_permission_team_none():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="Hierarchy Test",
        content="content",
        author_access="Read & Write",
        team_access="None",
        authenticated_access="Read & Write",
        public_access="Read Only"
    )

    assert blog.author_access == "Read & Write"
    assert blog.team_access == "None"
    assert blog.authenticated_access == "None"
    assert blog.public_access == "None"

def test_permission_authenticated_none():
    user = create_user()
    blog = Blog.objects.create(
        author=user,
        title="Hierarchy Test",
        content="content",
        author_access="Read & Write",
        team_access="Read Only",
        authenticated_access="None",
        public_access="Read Only"
    )

    assert blog.author_access == "Read & Write"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "None"
    assert blog.public_access == "None"