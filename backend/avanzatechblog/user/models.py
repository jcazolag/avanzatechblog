from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import is_password_usable


# Create your models here.

class Team(models.Model):
    title = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.title

class Role(models.Model):
    title = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.title

class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        if not password:
            raise ValueError(_('The Password must be set'))

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user._password_already_hashed = True  # Marcar como ya hasheada
        user.save(using=self._db)

        return user
    
    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self._create_user(email, password, **extra_fields)

    def create_admin(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', False)
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Admin must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not False:
            raise ValueError(_('Admin must have is_superuser=False.'))
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    #username = models.CharField(_('username'), max_length=255, unique=True)
    email = models.EmailField(_('email address'), unique=True)
    is_superuser = models.BooleanField(_('superuser status'), default=False)
    is_staff = models.BooleanField(_('staff status'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    date_joined = models.DateTimeField(_('joined date'), auto_now_add=True)
    team = models.ForeignKey(Team, on_delete=models.RESTRICT, null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, null=True, blank=True)


    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    _password_already_hashed = False

    class Meta:
        ordering = ["-date_joined"]
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        role = self.role
        team = self.team
        if self.is_staff is True:
            if not self.role or self.role.title != 'admin':
                role, created = Role.objects.get_or_create(title='admin')
            if not self.team or self.team.title != 'admin':
                team, created = Team.objects.get_or_create(title='admin')
        else:
            if not self.role or self.role.title == 'admin':
                role, created = Role.objects.get_or_create(title='blogger')
            if not self.team or self.team.title == 'admin':
                team, created = Team.objects.get_or_create(title='default')

        self.team=team
        self.role=role
        if not getattr(self, '_password_already_hashed', False):
            self.set_password(self.password)

        super().save(*args, **kwargs)