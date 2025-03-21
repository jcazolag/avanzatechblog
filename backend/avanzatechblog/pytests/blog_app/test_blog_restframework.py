from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from blog.models import Blog
from user.models import Team, Role

User = get_user_model()

class BlogViewSetTest(APITestCase):
    def setUp(self):
        """Configura los datos de prueba"""
        self.user = User.objects.create_user(username='user', email='user@email.com', password='password')
        self.team = self.user.team  # Asumiendo que el usuario tiene un equipo
        self.admin = User.objects.create_superuser(username='admin', email='admin@email.com',password='password')
        
        self.blog = Blog.objects.create(
            author=self.user,
            title='Test Blog',
            content='Test Content',
            excerpt='Test Excerpt',
            author_access='Read & Write',
            team_access='Read Only',
            authenticated_access='None',
            public_access='None'
        )
        
        self.blog_url = f'/api/blog/post/{self.blog.id}/'
        self.list_url = '/api/blog/list/'
        self.create_url = '/api/blog/post/'
    
    def test_create_blog_authenticated(self):
        """Verifica que un usuario autenticado pueda crear un blog"""
        self.client.login(username='user', email='user@email.com', password='password')
        data = {
            'title': 'New Blog',
            'content': 'New Content',
            'author_access': 'Read & Write',
            'team_access': 'Read Only',
            'authenticated_access': 'None',
            'public_access': 'None'
        }
        response = self.client.post(self.create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_blog_as_admin(self):
        """Verifica que un administrador no pueda crear blogs"""
        self.client.login(username='admin', email='admin@email.com',password='password')
        data = {
            'title': 'Admin Blog',
            'content': 'Admin Content',
            'author_access': 'Read & Write',
            'team_access': 'Read Only',
            'authenticated_access': 'None',
            'public_access': 'None'
        }
        response = self.client.post(self.create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_blogs(self):
        """Verifica que los blogs accesibles sean listados correctamente"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_retrieve_blog_with_access(self):
        """Verifica que un usuario con acceso pueda ver el blog"""
        self.client.login(username='user', password='password')
        response = self.client.get(self.blog_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_retrieve_blog_without_access(self):
        """Verifica que un usuario sin acceso no pueda ver el blog"""
        other_team = Team.objects.create(title='other')
        other_user = User.objects.create_user(username='other', email='other@email.com',password='password', team=other_team)
        self.client.login(username='other', password='password')
        response = self.client.get(self.blog_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_blog_authorized(self):
        """Verifica que un usuario con permisos pueda actualizar su blog"""
        self.client.login(username='user', emai='user@email.com',password='password')
        data = {
            'title': 'Updated Title',
            'content': 'Updated Content',
            'author_access': 'Read & Write',
            'team_access': 'Read Only',
            'authenticated_access': 'None',
            'public_access': 'None'
        }
        response = self.client.put(self.blog_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_blog_unauthorized(self):
        """Verifica que un usuario sin permisos no pueda actualizar el blog de otro"""
        other_user = User.objects.create_user(username='other', email='other@email.com', password='password')
        self.client.login(username='other', password='password')
        data = {'title': 'Hacked Title'}
        response = self.client.put(self.blog_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_blog_authorized(self):
        """Verifica que un usuario con permisos pueda eliminar su blog"""
        self.client.login(username='user', password='password')
        response = self.client.delete(self.blog_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_delete_blog_unauthorized(self):
        """Verifica que un usuario sin permisos no pueda eliminar el blog de otro"""
        other_user = User.objects.create_user(username='other', email='other@email.com', password='password')
        self.client.login(username='other', password='password')
        response = self.client.delete(self.blog_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)