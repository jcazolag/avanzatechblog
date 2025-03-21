import pytest
from blog.models import Blog
from user.models import User, Team, Role
from django.core.exceptions import ValidationError

@pytest.mark.django_db
def test_create_blog():
    """Verifica que se pueda crear un blog correctamente"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    blog = Blog.objects.create(author=user, title="Test Blog", content="Este es un contenido de prueba")

    assert blog.title == "Test Blog"
    assert blog.author == user
    assert blog.content == "Este es un contenido de prueba"
    assert blog.excerpt == "Este es un contenido de prueba"
    assert Blog.objects.count() == 1

@pytest.mark.django_db
def test_admin_cannot_be_author():
    """Verifica que un administrador no pueda ser autor de un blog"""
    admin_role = Role.objects.create(title="admin")
    admin_team = Team.objects.create(title="admin")
    admin_user = User.objects.create_superuser(username="admin", email="admin@example.com", password="adminpass")
    
    admin_user.role = admin_role
    admin_user.team = admin_team
    admin_user.save()

    with pytest.raises(ValidationError, match="Administrators cannot be assigned as authors."):
        blog = Blog(author=admin_user, title="Admin Blog", content="Contenido del admin")
        blog.clean()

@pytest.mark.django_db
def test_excerpt_is_auto_generated():
    """Verifica que el excerpt se genere automáticamente si el contenido es largo"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    blog = Blog.objects.create(author=user, title="Test Blog", content=content)

    assert blog.excerpt == content[:200]  # El excerpt debe ser los primeros 200 caracteres del contenido

@pytest.mark.django_db
def test_default_access_values():
    """Verifica que los valores de acceso tengan los valores por defecto"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    blog = Blog.objects.create(author=user, title="Test Blog", content="Contenido de prueba")

    assert blog.author_access == "Read & Write"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "Read Only"
    assert blog.public_access == "Read Only"

@pytest.mark.django_db
def test_permission_adjustment():
    """Verifica que los permisos se ajusten correctamente según la jerarquía"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    blog = Blog.objects.create(
        author=user,
        title="Test Blog",
        content="Contenido de prueba",
        author_access="Read Only",
        team_access="Read & Write",
        authenticated_access="None",
        public_access="Read & Write"
    )

    assert blog.author_access == "Read Only"  # No debería cambiar
    assert blog.team_access == "Read Only"  # Se ajusta a la jerarquía del autor
    assert blog.authenticated_access == "None"  # No debería cambiar
    assert blog.public_access == "None"  # Se ajusta a la jerarquía

@pytest.mark.django_db
def test_validate_access_fields():
    """Verifica que los valores inválidos de permisos se corrijan automáticamente"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
    blog = Blog.objects.create(
        author=user,
        title="Test Blog",
        content="Contenido de prueba",
        author_access="INVALID",  # Valor no válido
        team_access="INVALID",  # Valor no válido
        authenticated_access="INVALID",  # Valor no válido
        public_access="INVALID"  # Valor no válido
    )

    assert blog.author_access == "Read Only"
    assert blog.team_access == "Read Only"
    assert blog.authenticated_access == "Read Only"
    assert blog.public_access == "Read Only"

@pytest.mark.django_db
def test_author_and_public_access_restrictions():
    """Verifica que author_access tenga al menos 'Read Only' y public_access no supere 'Read Only'"""
    user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")

    blog = Blog.objects.create(
        author=user,
        title="Test Blog",
        content="Contenido de prueba",
        author_access="None",  # Se debe corregir a "Read Only"
        public_access="Read & Write"  # Se debe corregir a "Read Only"
    )

    assert blog.author_access == "Read Only"
    assert blog.public_access == "Read Only"