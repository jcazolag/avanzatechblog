import pytest
from blog.models import Blog
from blog.serializers import BlogSerializer
from user.models import User
from rest_framework.exceptions import ValidationError

pytestmark = pytest.mark.django_db

def create_user_and_context():
    user = User.objects.create_user(email="u@test.com", password="pass")
    context = {'request': type('Request', (), {'user': user})()}
    return user, context

def test_valid_hierarchy():
    user, context = create_user_and_context()
    data = {
        'title': 'Test',
        'content': 'content',
        'author_access': 'Read & Write',
        'team_access': 'Read Only',
        'authenticated_access': 'Read Only',
        'public_access': 'None',
    }
    serializer = BlogSerializer(data=data, context=context)
    assert serializer.is_valid(), serializer.errors

def test_author_read_only_prevents_team_write():
    user, context = create_user_and_context()
    data = {
        'title': 'Test',
        'content': 'content',
        'author_access': 'Read Only',
        'team_access': 'Read & Write',
        'authenticated_access': 'None',
        'public_access': 'None',
    }
    serializer = BlogSerializer(data=data, context=context)
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)

def test_team_none_blocks_authenticated_and_public():
    user, context = create_user_and_context()
    data = {
        'title': 'Test',
        'content': 'content',
        'author_access': 'Read & Write',
        'team_access': 'None',
        'authenticated_access': 'Read Only',
        'public_access': 'Read Only',
    }
    serializer = BlogSerializer(data=data, context=context)
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)

def test_authenticated_none_blocks_public():
    user, context = create_user_and_context()
    data = {
        'title': 'Test',
        'content': 'content',
        'author_access': 'Read & Write',
        'team_access': 'Read Only',
        'authenticated_access': 'None',
        'public_access': 'Read Only',
    }
    serializer = BlogSerializer(data=data, context=context)
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)
