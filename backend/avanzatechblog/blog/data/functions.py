from typing import Union
from user.models import User
from blog.models import Blog
from django.contrib.auth.models import AnonymousUser

UserType = Union[User, AnonymousUser]

READABLE = ['Read Only', 'Read & Write']
WRITABLE = ['Read & Write']

def _validate_inputs(user: UserType, blog: Blog):
    if not isinstance(user, (User, AnonymousUser)):
        raise TypeError(f"{user} is not an instance of User or AnonymousUser")
    if not isinstance(blog, Blog):
        raise TypeError(f"{blog} is not an instance of Blog")

def can_edit_blog(user: UserType, blog: Blog) -> bool:
    _validate_inputs(user, blog)
    if not user.is_authenticated:
        return False

    is_author = blog.author == user and blog.author_access in WRITABLE
    is_team_member = hasattr(user, 'team') and blog.author.team == user.team and blog.team_access in WRITABLE
    is_authenticated_user = blog.authenticated_access in WRITABLE

    return is_author or is_team_member or is_authenticated_user

def can_view_blog(user: UserType, blog: Blog) -> bool:
    _validate_inputs(user, blog)

    if blog.public_access in READABLE:
        return True

    if not user.is_authenticated:
        return False

    is_authenticated_user = blog.authenticated_access in READABLE
    is_author = blog.author == user and blog.author_access in READABLE
    is_team_member = hasattr(user, 'team') and blog.author.team == user.team and blog.team_access in READABLE

    return is_authenticated_user or is_author or is_team_member

def can_interact_blog(user: UserType, blog: Blog) -> bool:
    _validate_inputs(user, blog)
    if not user.is_authenticated:
        return False

    is_authenticated_user = blog.authenticated_access in READABLE
    is_author = blog.author == user and blog.author_access in READABLE
    is_team_member = hasattr(user, 'team') and blog.author.team == user.team and blog.team_access in READABLE

    return is_authenticated_user or is_author or is_team_member
