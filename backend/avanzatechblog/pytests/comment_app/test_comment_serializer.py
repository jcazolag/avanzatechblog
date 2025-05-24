import pytest
from comment.serializers import CommentSerializer
from blog.models import Blog
from comment.models import Comment
from user.models import User, Team, Role
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIRequestFactory


@pytest.fixture
def admin_team():
    return Team.objects.create(title="admin")

@pytest.fixture
def regular_team():
    return Team.objects.create(title="team1")

@pytest.fixture
def regular_role():
    return Role.objects.create(title="user")

@pytest.fixture
def admin_role():
    return Role.objects.create(title="admin")

@pytest.fixture
def user_with_access(regular_team, regular_role):
    return User.objects.create_user(
        email="user1@example.com",
        password="password123",
        team=regular_team,
        role=regular_role,
    )

@pytest.fixture
def user_without_access(admin_team, admin_role):
    return User.objects.create_user(
        email="admin@example.com",
        password="adminpass",
        team=admin_team,
        role=admin_role,
        is_staff=True
    )

@pytest.fixture
def blog(user_with_access):
    return Blog.objects.create(
        author=user_with_access,
        title="Sample Blog",
        content="Content here",
        public_access=True
    )

@pytest.fixture
def comment(user_with_access, blog):
    from comment.models import Comment
    return Comment.objects.create(user=user_with_access, blog=blog, content="Great post!")

@pytest.mark.django_db
class TestCommentSerializer:

    def test_valid_comment_serialization(self, user_with_access, blog):
        factory = APIRequestFactory()
        request = factory.post('/comments/', {'content': 'Nice post!', 'blog': blog.id})
        request.user = user_with_access

        serializer = CommentSerializer(data={'content': 'Nice post!', 'blog': blog.id}, context={'request': request})
        assert serializer.is_valid(), serializer.errors

        instance = serializer.save()
        assert instance.content == 'Nice post!'
        assert instance.user == user_with_access
        assert instance.blog == blog

    def test_missing_blog_id(self, user_with_access):
        factory = APIRequestFactory()
        request = factory.post('/comments/', {'content': 'Hello'})
        request.user = user_with_access

        serializer = CommentSerializer(data={'content': 'Hello'}, context={'request': request})
        with pytest.raises(ValidationError) as e:
            serializer.is_valid(raise_exception=True)
        assert "This field is required." in str(e.value)

    def test_invalid_blog_id(self, user_with_access):
        factory = APIRequestFactory()
        request = factory.post('/comments/', {'content': 'Test', 'blog': 999})
        request.user = user_with_access

        serializer = CommentSerializer(data={'content': 'Test', 'blog': 999}, context={'request': request})
        with pytest.raises(ValidationError) as e:
            serializer.is_valid(raise_exception=True)
        assert "Invalid blog ID." in str(e.value)

    def test_user_without_access(self, user_without_access, blog):
        factory = APIRequestFactory()
        request = factory.post('/comments/', {'content': 'Blocked comment', 'blog': blog.id})
        request.user = user_without_access

        serializer = CommentSerializer(data={'content': 'Blocked comment', 'blog': blog.id}, context={'request': request})
        with pytest.raises(ValidationError) as e:
            serializer.is_valid(raise_exception=True)
        assert "You do not have permission to comment on this blog." in str(e.value)

    def test_user_and_blog_fields_are_read_only_in_output(self, comment):
        serializer = CommentSerializer(instance=comment)
        data = serializer.data
        assert data['user'] == comment.user.id
        assert data['user_name'] == comment.user.email
        assert data['blog'] == comment.blog.id
        assert data['blog_title'] == comment.blog.title
        assert 'timestamp' in data
