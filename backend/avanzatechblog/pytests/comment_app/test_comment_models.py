import pytest
from comment.models import Comment
from blog.models import Blog
from user.models import User, Team, Role
from django.core.exceptions import ValidationError
from datetime import datetime


@pytest.fixture
def team_admin():
    return Team.objects.create(title="admin")

@pytest.fixture
def team_user():
    return Team.objects.create(title="engineering")

@pytest.fixture
def role_admin():
    return Role.objects.create(title="admin")

@pytest.fixture
def role_user():
    return Role.objects.create(title="member")

@pytest.fixture
def admin_user(team_admin, role_admin):
    return User.objects.create(email="admin@example.com", is_staff=True, team=team_admin, role=role_admin)

@pytest.fixture
def user_with_access(team_user, role_user):
    return User.objects.create(email="user1@example.com", team=team_user, role=role_user)

@pytest.fixture
def user_without_access(team_user, role_user):
    return User.objects.create(email="user2@example.com", team=team_user, role=role_user)

@pytest.fixture
def blog(user_with_access):
    return Blog.objects.create(
        author=user_with_access,
        title="Test Blog",
        content="Content",
        public_access="None",
        authenticated_access="None",
        team_access="None",
        author_access="Read & Write"
    )


@pytest.mark.django_db
class TestCommentModel:

    def test_valid_comment_creation(self, user_with_access, blog):
        comment = Comment(user=user_with_access, blog=blog, content="Nice post!")
        comment.save()
        assert Comment.objects.count() == 1
        assert comment.content == "Nice post!"

    def test_comment_without_content_raises_error(self, user_with_access, blog):
        comment = Comment(user=user_with_access, blog=blog, content="")
        with pytest.raises(ValidationError) as e:
            comment.full_clean()
        assert "Content must be set." in str(e.value)

    def test_comment_on_nonexistent_blog_raises_error(self, user_with_access):
        blog = Blog(id=999)  # blog no existe en la DB
        comment = Comment(user=user_with_access, blog=blog, content="Hi")
        with pytest.raises(ValidationError) as e:
            comment.full_clean()
        assert "The blog does not exists." in str(e.value)

    def test_admin_cannot_comment(self, admin_user, blog):
        comment = Comment(user=admin_user, blog=blog, content="Admin trying to comment")
        with pytest.raises(ValidationError) as e:
            comment.full_clean()
        assert "Administrators cannot comment blogs." in str(e.value)

    def test_user_without_permission_cannot_comment(self, user_without_access, blog):
        comment = Comment(user=user_without_access, blog=blog, content="No access")
        with pytest.raises(ValidationError) as e:
            comment.full_clean()
        assert "You do not have permission to comment this blog." in str(e.value)

    def test_str_method(self, user_with_access, blog):
        comment = Comment(user=user_with_access, blog=blog, content="Nice!", timestamp=datetime.now())
        assert str(comment) == f"Comment by {user_with_access.email} on {blog.title}"
