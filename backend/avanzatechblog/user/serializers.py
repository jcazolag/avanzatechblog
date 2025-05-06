from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'password',
            'team'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email=validated_data['email']
        password=validated_data['password']

        if not password:
            raise serializers.ValidationError({'password': 'Password must be set.'})

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already taken."})

        #new_user = User.objects.create_user(email=email, username=username, password=password)
        #new_user.save()
        #return new_user
        return User.objects.create_user(email=email, password=password)