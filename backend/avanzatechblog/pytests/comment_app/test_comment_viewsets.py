import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from comment.models import Comment
from blog.models import Blog
from user.models import User

@pytest.fixture
def create_user_with_access(db, staff_team):
    def _create():
        return User.objects.create_user(email='user_with_access@example.com', password='testpass', team=staff_team)
    return _create()

@pytest.fixture
def create_user_no_access(db, guest_team):
    def _create():
        return User.objects.create_user(email='user_no_access@example.com', password='testpass', team=guest_team)
    return _create()

@pytest.fixture
def create_blog_accessible(db):
    def _create(user):
        return Blog.objects.create(
            title="Accessible Blog",
            content="Content",
            author=user,
            public_access='Read Only',
            authenticated_access='Read & Write',
            author_access='Read & Write',
            team_access='Read & Write',
        )
    return _create

@pytest.fixture
def create_blog_no_access(db):
    """
    Crea un blog con permisos restrictivos para que un usuario dado no pueda interactuar.
    """

    def _create_blog():
        # Creamos un autor diferente (no el usuario que se va a testear)
        author = User.objects.create_user(email="author@example.com", password="password123")

        # Creamos un blog con accesos muy restrictivos,
        # por ejemplo, solo público con acceso 'No Access'
        blog = Blog.objects.create(
            author=author,
            title="Blog no accesible",
            content="Contenido del blog",
            public_access='No Access',
            authenticated_access='No Access',
            team_access='No Access',
            author_access='No Access',
        )
        return blog

    return _create_blog


@pytest.mark.django_db
class TestCommentViewSet:
    def setup_method(self):
        self.client = APIClient()

    def test_create_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access
        blog = create_blog_accessible(user)
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:post', kwargs={'blog_id': blog.id})
        data = {'content': 'Test comment content'}
        response = self.client.post(url, data)

        assert response.status_code == 201
        assert response.data['content'] == 'Test comment content'

    def test_create_comment_no_permission(self, create_user_no_access, create_blog_no_access):
        user = create_user_no_access
        blog = create_blog_no_access()
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:post', kwargs={'blog_id': blog.id})
        data = {'content': 'No access comment'}
        response = self.client.post(url, data)

        assert response.status_code == 403
        assert 'permission' in response.data['message']

    def test_list_comments_filter_by_blog(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access
        blog = create_blog_accessible(user)
        Comment.objects.create(user=user, blog=blog, content='Comment 1')
        Comment.objects.create(user=user, blog=blog, content='Comment 2')

        self.client.force_authenticate(user=user)
        url = reverse('api:comment:list') + f'?blog_id={blog.id}'
        response = self.client.get(url)

        assert response.status_code == 200
        assert len(response.data['results']) == 2

    def test_retrieve_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access
        blog = create_blog_accessible(user)
        comment = Comment.objects.create(user=user, blog=blog, content='Comment')

        self.client.force_authenticate(user=user)
        url = reverse('api:comment:detail', kwargs={'pk': comment.id})
        response = self.client.get(url)

        assert response.status_code == 200
        assert response.data['content'] == 'Comment'

    def test_update_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access
        blog = create_blog_accessible(user)
        comment = Comment.objects.create(user=user, blog=blog, content='Old content')

        self.client.force_authenticate(user=user)
        url = reverse('api:comment:detail', kwargs={'pk': comment.id})
        response = self.client.put(url, {'content': 'Updated content'})

        assert response.status_code == 200
        assert response.data['content'] == 'Updated content'

    def test_delete_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access
        blog = create_blog_accessible(user)
        comment = Comment.objects.create(user=user, blog=blog, content='To be deleted')

        self.client.force_authenticate(user=user)
        url = reverse('api:comment:detail', kwargs={'pk': comment.id})
        response = self.client.delete(url)

        assert response.status_code == 204
        assert not Comment.objects.filter(pk=comment.id).exists()
