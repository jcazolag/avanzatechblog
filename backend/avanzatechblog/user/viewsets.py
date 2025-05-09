from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

class UserViewset(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        user = request.user

        if user.is_authenticated:
            return Response({"message": "You are arleady loged."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=user)
            return Response({"message": "User created succesfully" ,"User": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"message": serializer.errors}, status=status.HTTP_409_CONFLICT)

    def retrieve(self, request, *args, **kwargs):
        """Devuelve la información del usuario solicitado por pk"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"message": "Success", "User": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Devuelve la información del usuario autenticado"""
        user = request.user
        if not user.is_authenticated:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(user)
        return Response({"message": "Success", "User": serializer.data}, status=status.HTTP_200_OK)