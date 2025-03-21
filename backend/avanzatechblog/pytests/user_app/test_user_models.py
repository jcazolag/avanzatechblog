import pytest
from user.models import User, Team, Role

@pytest.mark.django_db
def test_create_team():
    """Verifica que se pueda crear un equipo"""
    team = Team.objects.create(title="Development")
    assert team.title == "Development"
    assert Team.objects.count() == 1

@pytest.mark.django_db
def test_create_role():
    """Verifica que se pueda crear un rol"""
    role = Role.objects.create(title="Manager")
    assert role.title == "Manager"
    assert Role.objects.count() == 1

@pytest.mark.django_db
def test_create_user():
    """Verifica que se pueda crear un usuario con el UserManager"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")

    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.is_staff is False
    assert user.is_superuser is False
    assert user.check_password("testpass")
    assert User.objects.count() == 1

@pytest.mark.django_db
def test_create_superuser():
    """Verifica que se pueda crear un superusuario correctamente"""
    user = User.objects.create_superuser(username="admin", email="admin@example.com", password="adminpass")

    assert user.username == "admin"
    assert user.email == "admin@example.com"
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.check_password("adminpass")
    assert User.objects.count() == 1

@pytest.mark.django_db
def test_create_admin():
    """Verifica que se pueda crear un usuario administrador correctamente"""
    user = User.objects.create_admin(username="adminuser", email="adminuser@example.com", password="adminpass")

    assert user.username == "adminuser"
    assert user.email == "adminuser@example.com"
    assert user.is_staff is True
    assert user.is_superuser is False
    assert user.check_password("adminpass")
    assert User.objects.count() == 1

@pytest.mark.django_db
def test_user_save_assigns_role_and_team():
    """Verifica que el método save() asigna roles y equipos automáticamente"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    
    assert user.team is not None
    assert user.role is not None
    assert user.role.title == "blogger"
    assert user.team.title == "default"

@pytest.mark.django_db
def test_admin_user_gets_admin_role_and_team():
    """Verifica que los usuarios staff obtienen el rol y equipo admin"""
    user = User.objects.create_user(username="adminuser", email="admin@example.com", password="adminpass", is_staff=True)
    
    assert user.team is not None
    assert user.role is not None
    assert user.role.title == "admin"
    assert user.team.title == "admin"