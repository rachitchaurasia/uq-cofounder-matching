from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for basic User info shown within Profile."""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name'] # Fields from User model to expose

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating the UserProfile."""
    # Make the user field read-only, display nested User info
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        # Exclude fields managed automatically or link fields
        exclude = ['created_at', 'updated_at', 'id'] # 'user' is handled above
        # Alternatively, explicitly list fields:
        fields = [ 'user', 'city', 'country_code', ..., 'startup_goals']
