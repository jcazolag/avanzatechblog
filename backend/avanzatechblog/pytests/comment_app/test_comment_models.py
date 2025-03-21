import pytest
from django.core.exceptions import ValidationError
from blog.models import Blog
from comment.models import Comment
from user.models import User, Team


@pytest.mark.django_db
class TestCommentModel:

    def setup_method(self):
        """Configura los datos de prueba."""
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
        self.blog = Blog.objects.create(
            author=self.user,
            title="Sample Blog",
            content="This is a test blog.",
            public_access="Read Only",
        )
        self.comment = Comment.objects.create(user=self.user, blog=self.blog, content="Nice blog!")

    def test_comment_creation(self):
        """✅ Prueba que se pueda crear un comentario."""
        assert self.comment.content == "Nice blog!"
        assert self.comment.user == self.user
        assert self.comment.blog == self.blog

    def test_comment_str(self):
        """✅ Prueba el método `__str__` del modelo `Comment`."""
        assert str(self.comment) == f"Comment by {self.user.username} on {self.blog.title}"

    def test_comment_timestamp_auto(self):
        """✅ Prueba que el timestamp se asigna automáticamente al crear un comentario."""
        assert self.comment.timestamp is not None

    def test_comment_access(self):
        team = Team.objects.create(title="alpha")
        user = User.objects.create_user(username="other", email="other@email.com", password="other", team=team)
        team_blog = Blog.objects.create(
            author=self.user,
            title="Team Blog",
            content="This is a team blog.",
            authenticated_access="None",
            public_access="None",
        )

        with pytest.raises(ValidationError, match="You do not have permission to comment this blog."):
            like = Comment.objects.create(user=user, blog=team_blog, content="Comment")
            like.full_clean()