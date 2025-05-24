import pytest
from user.models import User
from user.serializers import UserSerializer

@pytest.mark.django_db
class TestUserSerializer:

    def test_valid_user_creation(self):
        data = {
            "email": "newuser@example.com",
            "password": "securepass123"
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()

        assert User.objects.count() == 1
        assert user.email == data["email"]
        assert user.check_password(data["password"])

    def test_duplicate_email_fails(self):
        User.objects.create_user(email="duplicate@example.com", password="pass123")

        data = {
            "email": "duplicate@example.com",
            "password": "newpass456"
        }
        serializer = UserSerializer(data=data)
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_password_is_write_only(self):
        user = User.objects.create_user(email="hiddenpass@example.com", password="topsecret")
        serializer = UserSerializer(user)

        assert "password" not in serializer.data  # password no debe aparecer al serializar
