from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User info shown AND UPDATED within Profile."""
    class Meta:
        model = User
        # Allow updating first/last name, but keep email/id read-only here
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'email'] # Email changes should go through allauth views

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating the UserProfile."""
    # Make user field writable for specific fields
    user = UserSerializer() # No longer read_only=True

    class Meta:
        model = UserProfile
        # List all fields from UserProfile model you want to expose/update
        fields = [
            'id', # Keep id read-only by default
            'user', # Nested user object
            'city', 'country_code', 'region', 'about', 'avatar', 'url',
            'position', 'current_company_name', 'current_company_id',
            'experience_details', 'experience_level',
            'education_summary', 'education_details',
            'skills', 'skill_categories', 'languages', 'interests',
            'startup_industries', 'startup_goals',
            'certifications', 'courses', 'recommendations_count', 'volunteer_experience',
            'role', 'show_role_on_profile', 'offers', 'phone', # Add new fields
            # Add 'looking_for' if added to model
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Handle nested User update
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            # Update only allowed fields on the User model
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.save()

        # Handle UserProfile fields update (default ModelSerializer behavior)
        # Mark profile as saved to potentially prevent signal recursion
        instance._profile_saved = True
        instance = super().update(instance, validated_data)
        del instance._profile_saved # Clean up temporary attribute
        return instance
