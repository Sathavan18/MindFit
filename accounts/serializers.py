from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for Django's User model
    Automatically hashes passwords and creates user accounts securely
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        # password set to write only, never returned in responses
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        """
        Create a new user with hashed password.
        Uses create_user() method to properly hash the password (never stored in plaintext).
        """
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Used for creating and updating user profiles after registration
    """
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user']