import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from comment.models import Comment
from blog.models import Blog
from user.models import User, Team

@pytest.fixture
def staff_team(db):
    return Team.objects.create(title='staff_team')

@pytest.fixture
def guest_team(db):
    return Team.objects.create(title='guest_team')

@pytest.fixture
def create_user_with_access(db, staff_team):
    def _create():
        return User.objects.create_user(email='user_with_access@example.com', password='testpass', team=staff_team)
    return _create

@pytest.fixture
def create_user_no_access(db, guest_team):
    def _create():
        return User.objects.create_user(email='user_no_access@example.com', password='testpass', team=guest_team)
    return _create

@pytest.fixture
def create_blog_accessible(db, create_user_with_access):
    def _create(owner=None):
        if owner is None:
            owner = create_user_with_access()
        return Blog.objects.create(
            author=owner,
            title='Accessible Blog',
            content='Some content',
            public_access='Read Only',
            authenticated_access='Read & Write',
            author_access='Read & Write',
            team_access='Read & Write',
        )
    return _create

@pytest.fixture
def create_blog_author_only_accessible(db, create_user_with_access):
    def _create(owner=None):
        if owner is None:
            owner = create_user_with_access()
        return Blog.objects.create(
            author=owner,
            title='Accessible Blog',
            content='Some content',
            public_access='None',
            authenticated_access='None',
            author_access='Read & Write',
            team_access='None',
        )
    return _create

@pytest.fixture
def create_blog_no_access(db, create_user_no_access):
    def _create(owner=None):
        if owner is None:
            owner = create_user_no_access()
        return Blog.objects.create(
            author=owner,
            title='No Access Blog',
            content='Some content',
            public_access='None',
            authenticated_access='None',
            author_access='Read Only',
            team_access='None',
        )
    return _create

@pytest.mark.django_db
class TestCommentViewSet:

    def setup_method(self):
        self.client = APIClient()

    def test_create_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access()
        blog = create_blog_accessible(owner=user)
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:post', kwargs={'blog_id': blog.id})
        data = {'content': 'This is a comment'}
        response = self.client.post(url, data)

        assert response.status_code == 201
        assert response.data['content'] == 'This is a comment'
        assert response.data['user'] == user.id
        assert response.data['blog'] == blog.id

    def test_create_comment_no_permission(self, create_user_no_access, create_blog_author_only_accessible):
        user = create_user_no_access()
        blog = create_blog_author_only_accessible()
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:post', kwargs={'blog_id': blog.id})
        data = {'content': 'No access comment'}
        response = self.client.post(url, data)

        assert response.status_code == 403
        assert 'permission' in response.data['message'].lower()

    def test_list_comments_filter_by_blog(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access()
        blog = create_blog_accessible(owner=user)
        self.client.force_authenticate(user=user)

        comment1 = Comment.objects.create(user=user, blog=blog, content="Comment 1")
        other_blog = create_blog_accessible(owner=user)
        comment2 = Comment.objects.create(user=user, blog=other_blog, content="Comment 2")

        url = reverse('api:comment:list')
        response = self.client.get(url, {'blog_id': blog.id})

        assert response.status_code == 200
        results = response.data['results']
        assert any(c['id'] == comment1.id for c in results)
        assert all(c['blog'] == blog.id for c in results)

    def test_retrieve_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access()
        blog = create_blog_accessible(owner=user)
        comment = Comment.objects.create(user=user, blog=blog, content="Retrieve test")
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:detail', kwargs={'pk': comment.id})
        response = self.client.get(url)

        assert response.status_code == 200
        assert response.data['content'] == "Retrieve test"
        assert response.data['id'] == comment.id

    def test_delete_comment_success(self, create_user_with_access, create_blog_accessible):
        user = create_user_with_access()
        blog = create_blog_accessible(owner=user)
        comment = Comment.objects.create(user=user, blog=blog, content="Delete me")
        self.client.force_authenticate(user=user)

        url = reverse('api:comment:detail', kwargs={'pk': comment.id})
        response = self.client.delete(url)

        assert response.status_code == 204
        assert not Comment.objects.filter(id=comment.id).exists()
