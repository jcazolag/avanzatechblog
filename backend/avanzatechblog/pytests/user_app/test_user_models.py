import pytest
from django.contrib.auth import get_user_model
from user.models import Team, Role, User

@pytest.mark.django_db
class TestModels:

    def test_team_str(self):
        team = Team.objects.create(title="Developers")
        assert str(team) == "Developers"

    def test_role_str(self):
        role = Role.objects.create(title="Editor")
        assert str(role) == "Editor"

    def test_create_regular_user(self):
        user = User.objects.create_user(email="user@example.com", password="test123")
        
        assert user.email == "user@example.com"
        assert user.check_password("test123")
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.role.title == "blogger"
        assert user.team.title == "default"

    def test_create_superuser(self):
        user = User.objects.create_superuser(email="admin@example.com", password="superpass")
        
        assert user.email == "admin@example.com"
        assert user.is_staff is True
        assert user.is_superuser is True
        assert user.check_password("superpass")
        assert user.role.title == "admin"
        assert user.team.title == "admin"

    def test_create_admin(self):
        user = User.objects.create_admin(email="admin2@example.com", password="adminpass")
        
        assert user.is_staff is True
        assert user.is_superuser is False
        assert user.role.title == "admin"
        assert user.team.title == "admin"

    def test_save_non_staff_sets_blogger_default(self):
        Role.objects.create(title="admin")
        Team.objects.create(title="admin")
        user = User(email="normal@example.com", password="123")
        user.is_staff = False
        user.save()
        
        assert user.role.title == "blogger"
        assert user.team.title == "default"

    def test_save_staff_sets_admin_team_and_role(self):
        user = User(email="staff@example.com", password="123", is_staff=True)
        user.save()

        assert user.role.title == "admin"
        assert user.team.title == "admin"
