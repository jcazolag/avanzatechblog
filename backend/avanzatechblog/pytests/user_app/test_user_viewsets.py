import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from user.models import User

pytestmark = pytest.mark.django_db


def test_register_user():
    client = APIClient()
    url = reverse("api:user:register")
    data = {"email": "newuser@example.com", "password": "testpass123"}
    response = client.post(url, data)
    assert response.status_code == 201
    assert "id" in response.data
    assert response.data["email"] == "newuser@example.com"


def test_cannot_register_when_logged_in():
    user = User.objects.create_user(email="user@example.com", password="pass")
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("api:user:register")
    data = {"email": "other@example.com", "password": "testpass"}
    response = client.post(url, data)
    assert response.status_code == 403
    assert response.data["message"] == "You are arleady loged."


def test_login_success():
    User.objects.create_user(email="login@example.com", password="testpass")
    client = APIClient()
    url = reverse("api:user:login")
    data = {"email": "login@example.com", "password": "testpass"}
    response = client.post(url, data)
    assert response.status_code == 200
    assert response.data["email"] == "login@example.com"


def test_login_invalid_credentials():
    client = APIClient()
    url = reverse("api:user:login")
    data = {"email": "fake@example.com", "password": "wrongpass"}
    response = client.post(url, data)
    assert response.status_code == 401
    assert response.data["message"] == "Invalid credentials"


def test_me_view():
    user = User.objects.create_user(email="me@example.com", password="secret")
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("api:user:me")
    response = client.get(url)
    assert response.status_code == 200
    assert response.data["email"] == user.email


def test_me_view_unauthenticated():
    client = APIClient()
    url = reverse("api:user:me")
    response = client.get(url)
    assert response.status_code == 403


def test_logout():
    user = User.objects.create_user(email="logout@example.com", password="secret")
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("api:user:logout")
    response = client.post(url)
    assert response.status_code == 200
    assert response.data["message"] == "Logged out successfully"

def test_logout_unauthenticated():
    client = APIClient()
    url = reverse("api:user:logout")
    response = client.post(url)
    assert response.status_code == 403

def test_retrieve_existing_user():
    user = User.objects.create_user(email="findme@example.com", password="secret")
    client = APIClient()
    url = reverse("api:user:retrieve", kwargs={"pk": user.pk})
    response = client.get(url)
    assert response.status_code == 200
    assert response.data["email"] == user.email


def test_retrieve_non_existing_user():
    client = APIClient()
    url = reverse("api:user:retrieve", kwargs={"pk": 999})
    response = client.get(url)
    assert response.status_code == 404
    assert response.data["message"] == "No user matches the query."
